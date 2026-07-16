import json
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.place_dna import (
    PlaceDNALandmark,
    PlaceDNALocation,
    PlaceDNAResponse,
    PlaceDNAStats,
)


@dataclass(frozen=True, slots=True)
class PlaceCardEnrichmentTarget:
    id: str
    lat: float
    lon: float
    radius_m: int


def find_cached_place_card(
    db: Session,
    lat: float,
    lon: float,
    cache_distance_m: int = 150,
    max_age_days: int = 30,
) -> PlaceDNAResponse | None:
    select_query = text(
        """
        SELECT
            id,
            lat,
            lon,
            search_radius_m,
            place_name,
            title,
            rarity,
            region_type,
            green_score,
            population_pressure,
            built_up_score,
            water_access_score,
            connectivity_score,
            liveability_score,
            traits,
            description,
            landmark_name,
            landmark_distance_m,
            landmark_image_url,
            enrichment_status,
            enrichment_attempted_at,
            enrichment_error,
            created_at,
            ST_Distance(
                geom,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
            ) AS distance_from_click_m
        FROM place_cards
        WHERE
            geom IS NOT NULL
            AND created_at >= NOW() - (:max_age_days || ' days')::interval
            AND ST_DWithin(
                geom,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                :cache_distance_m
            )
        ORDER BY
            distance_from_click_m ASC,
            created_at DESC
        LIMIT 1
        """
    )

    row = db.execute(
        select_query,
        {
            "lat": lat,
            "lon": lon,
            "cache_distance_m": cache_distance_m,
            "max_age_days": max_age_days,
        },
    ).mappings().first()
    if row is None:
        return None

    traits = row["traits"]
    if isinstance(traits, str):
        try:
            parsed_traits = json.loads(traits)
        except json.JSONDecodeError:
            parsed_traits = [traits]
    elif isinstance(traits, list):
        parsed_traits = traits
    else:
        parsed_traits = list(traits or [])

    return PlaceDNAResponse(
        id=str(row["id"]),
        place_name=row["place_name"],
        title=row["title"],
        rarity=row["rarity"],
        region_type=row["region_type"],
        stats=PlaceDNAStats(
            green_cover=row["green_score"],
            population_pressure=row["population_pressure"],
            built_up_density=row["built_up_score"],
            water_access=row["water_access_score"],
            connectivity=row["connectivity_score"],
            liveability=row["liveability_score"],
        ),
        traits=[str(trait) for trait in parsed_traits],
        description=row["description"],
        landmark=PlaceDNALandmark(
            name=row["landmark_name"] or "No major landmark found nearby",
            distance_m=row["landmark_distance_m"],
            image_url=row["landmark_image_url"],
        ),
        location=PlaceDNALocation(
            lat=row["lat"],
            lon=row["lon"],
            radius_m=row["search_radius_m"],
        ),
        enrichment_status=row["enrichment_status"] or "basic",
        enrichment_attempted_at=row["enrichment_attempted_at"],
        enrichment_error=row["enrichment_error"],
    )


def save_place_card(db: Session, card: PlaceDNAResponse) -> str:
    insert_query = text(
        """
        INSERT INTO place_cards (
            lat,
            lon,
            search_radius_m,
            place_name,
            title,
            rarity,
            region_type,
            green_score,
            population_pressure,
            built_up_score,
            water_access_score,
            connectivity_score,
            liveability_score,
            traits,
            description,
            landmark_name,
            landmark_distance_m,
            landmark_image_url,
            enrichment_status,
            enrichment_attempted_at,
            enrichment_error,
            geom
        )
        VALUES (
            :lat,
            :lon,
            :search_radius_m,
            :place_name,
            :title,
            :rarity,
            :region_type,
            :green_score,
            :population_pressure,
            :built_up_score,
            :water_access_score,
            :connectivity_score,
            :liveability_score,
            CAST(:traits AS JSONB),
            :description,
            :landmark_name,
            :landmark_distance_m,
            :landmark_image_url,
            :enrichment_status,
            :enrichment_attempted_at,
            :enrichment_error,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
        )
        RETURNING id
        """
    )

    params = {
        "lat": card.location.lat,
        "lon": card.location.lon,
        "search_radius_m": card.location.radius_m,
        "place_name": card.place_name,
        "title": card.title,
        "rarity": card.rarity,
        "region_type": card.region_type,
        "green_score": card.stats.green_cover,
        "population_pressure": card.stats.population_pressure,
        "built_up_score": card.stats.built_up_density,
        "water_access_score": card.stats.water_access,
        "connectivity_score": card.stats.connectivity,
        "liveability_score": card.stats.liveability,
        "traits": json.dumps(card.traits),
        "description": card.description,
        "landmark_name": card.landmark.name,
        "landmark_distance_m": card.landmark.distance_m,
        "landmark_image_url": card.landmark.image_url,
        "enrichment_status": card.enrichment_status,
        "enrichment_attempted_at": card.enrichment_attempted_at,
        "enrichment_error": card.enrichment_error,
    }

    try:
        inserted_id = db.execute(insert_query, params).scalar_one()
        db.commit()
    except Exception:
        db.rollback()
        raise

    return str(inserted_id)


def find_cards_pending_enrichment(
    db: Session,
    *,
    limit: int,
) -> list[PlaceCardEnrichmentTarget]:
    if limit <= 0:
        return []

    query = text(
        """
        SELECT id, lat, lon, search_radius_m
        FROM place_cards
        WHERE enrichment_status IN ('basic', 'failed_enrichment')
        ORDER BY enrichment_attempted_at ASC NULLS FIRST, created_at ASC
        LIMIT :limit
        """
    )
    rows = db.execute(query, {"limit": limit}).mappings().all()
    return [
        PlaceCardEnrichmentTarget(
            id=str(row["id"]),
            lat=float(row["lat"]),
            lon=float(row["lon"]),
            radius_m=int(row["search_radius_m"]),
        )
        for row in rows
    ]


def update_place_card_enrichment(
    db: Session,
    *,
    card_id: str,
    card: PlaceDNAResponse,
) -> None:
    query = text(
        """
        UPDATE place_cards
        SET
            place_name = :place_name,
            title = :title,
            rarity = :rarity,
            region_type = :region_type,
            green_score = :green_score,
            population_pressure = :population_pressure,
            built_up_score = :built_up_score,
            water_access_score = :water_access_score,
            connectivity_score = :connectivity_score,
            liveability_score = :liveability_score,
            traits = CAST(:traits AS JSONB),
            description = :description,
            landmark_name = :landmark_name,
            landmark_distance_m = :landmark_distance_m,
            landmark_image_url = :landmark_image_url,
            enrichment_status = :enrichment_status,
            enrichment_attempted_at = :enrichment_attempted_at,
            enrichment_error = :enrichment_error
        WHERE id = :card_id
        """
    )
    params = {
        "card_id": card_id,
        "place_name": card.place_name,
        "title": card.title,
        "rarity": card.rarity,
        "region_type": card.region_type,
        "green_score": card.stats.green_cover,
        "population_pressure": card.stats.population_pressure,
        "built_up_score": card.stats.built_up_density,
        "water_access_score": card.stats.water_access,
        "connectivity_score": card.stats.connectivity,
        "liveability_score": card.stats.liveability,
        "traits": json.dumps(card.traits),
        "description": card.description,
        "landmark_name": card.landmark.name,
        "landmark_distance_m": card.landmark.distance_m,
        "landmark_image_url": card.landmark.image_url,
        "enrichment_status": card.enrichment_status,
        "enrichment_attempted_at": card.enrichment_attempted_at,
        "enrichment_error": card.enrichment_error,
    }

    try:
        db.execute(query, params)
        db.commit()
    except Exception:
        db.rollback()
        raise


def mark_place_card_enrichment_failed(
    db: Session,
    *,
    card_id: str,
    error: str,
) -> None:
    query = text(
        """
        UPDATE place_cards
        SET
            enrichment_status = 'failed_enrichment',
            enrichment_attempted_at = NOW(),
            enrichment_error = :error
        WHERE id = :card_id
        """
    )

    try:
        db.execute(query, {"card_id": card_id, "error": error[:500]})
        db.commit()
    except Exception:
        db.rollback()
        raise
