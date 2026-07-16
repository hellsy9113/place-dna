import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.repositories.place_cards_repository import find_cached_place_card, save_place_card
from app.schemas.place_dna import PlaceDNAResponse
from app.services.card_quality import is_generated_card_useful_for_cache
from app.services.location_candidate_validator import (
    UNSUPPORTED_LOCATION_MESSAGE,
    validate_production_click,
)
from app.services.memory_card_cache import (
    get_memory_cached_card,
    set_memory_cached_card,
)
from app.services.place_dna_generator import generate_mock_place_dna

logger = logging.getLogger(__name__)

router = APIRouter(tags=["place-dna"])

CACHE_DISTANCE_M = 150
CACHE_MAX_AGE_DAYS = 30


@router.get("/place-dna", response_model=PlaceDNAResponse)
def get_place_dna(
    response: Response,
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_m: int = Query(500, ge=100, le=2000),
    force_refresh: bool = Query(False),
    db: Session = Depends(get_db),
) -> PlaceDNAResponse:
    if settings.production_validate_clicks:
        validation = validate_production_click(lat, lon)
        if not validation.is_valid:
            logger.info(
                "Rejected unsupported PlaceDNA coordinate lat=%s lon=%s reason=%s certainty=%s",
                lat,
                lon,
                validation.reason,
                validation.certainty_score,
            )
            if settings.production_skip_external_api_for_invalid_clicks:
                raise HTTPException(
                    status_code=422,
                    detail={
                        "message": UNSUPPORTED_LOCATION_MESSAGE,
                        "reason": validation.reason,
                        "certainty_score": validation.certainty_score,
                    },
                )
            logger.warning(
                "Invalid coordinate proceeded because production_skip_external_api_for_invalid_clicks is disabled"
            )

    if force_refresh:
        logger.info("Force refresh requested for lat=%s lon=%s", lat, lon)
        response.headers["X-PlaceDNA-Cache"] = "MISS"
    else:
        try:
            memory_card = get_memory_cached_card(lat=lat, lon=lon, radius_m=radius_m)
        except Exception:
            logger.exception("PlaceDNA memory cache lookup failed for lat=%s lon=%s", lat, lon)
            memory_card = None

        if memory_card is not None:
            logger.info("PlaceDNA memory cache hit for lat=%s lon=%s", lat, lon)
            response.headers["X-PlaceDNA-Cache"] = "HIT"
            response.headers["X-PlaceDNA-Cache-Tier"] = "MEMORY"
            return memory_card

        try:
            cached_card = find_cached_place_card(
                db=db,
                lat=lat,
                lon=lon,
                cache_distance_m=CACHE_DISTANCE_M,
                max_age_days=CACHE_MAX_AGE_DAYS,
            )
        except Exception:
            logger.exception("PlaceDNA cache lookup failed for lat=%s lon=%s", lat, lon)
            response.headers["X-PlaceDNA-Cache"] = "MISS"
        else:
            if cached_card is not None:
                logger.info("PlaceDNA cache hit for lat=%s lon=%s", lat, lon)
                response.headers["X-PlaceDNA-Cache"] = "HIT"
                response.headers["X-PlaceDNA-Cache-Tier"] = "POSTGIS"
                _remember_card(lat=lat, lon=lon, radius_m=radius_m, card=cached_card)
                return cached_card
            logger.info("PlaceDNA cache miss for lat=%s lon=%s", lat, lon)
            response.headers["X-PlaceDNA-Cache"] = "MISS"

    try:
        card = PlaceDNAResponse.model_validate(
            generate_mock_place_dna(
                lat=lat,
                lon=lon,
                radius_m=radius_m,
                use_external_landmark_lookup=(
                    settings.production_use_external_landmark_lookup
                ),
            )
        )
    except Exception as exc:
        logger.exception("PlaceDNA generation failed before database save")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate PlaceDNA card.",
        ) from exc

    if (
        settings.production_use_external_landmark_lookup
        and settings.production_cache_only_useful_cards
        and not is_generated_card_useful_for_cache(card)
    ):
        logger.info("Skipping cache save for vague generated card lat=%s lon=%s", lat, lon)
        result = card.model_copy(update={"id": "unsaved"})
        _remember_card(lat=lat, lon=lon, radius_m=radius_m, card=result)
        return result

    try:
        card_id = save_place_card(db, card)
        result = card.model_copy(update={"id": card_id})
    except Exception:
        logger.exception("PlaceDNA generated but database save failed")
        result = card.model_copy(update={"id": "unsaved"})

    _remember_card(lat=lat, lon=lon, radius_m=radius_m, card=result)
    return result


def _remember_card(
    *,
    lat: float,
    lon: float,
    radius_m: int,
    card: PlaceDNAResponse,
) -> None:
    try:
        set_memory_cached_card(lat=lat, lon=lon, radius_m=radius_m, card=card)
    except Exception:
        logger.exception("PlaceDNA memory cache save failed for lat=%s lon=%s", lat, lon)
