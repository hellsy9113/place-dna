import json

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.place_dna import PlaceDNAResponse


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
    }

    try:
        inserted_id = db.execute(insert_query, params).scalar_one()
        db.commit()
    except Exception:
        db.rollback()
        raise

    return str(inserted_id)
