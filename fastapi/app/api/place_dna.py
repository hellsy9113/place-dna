import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.place_cards_repository import save_place_card
from app.schemas.place_dna import PlaceDNAResponse
from app.services.place_dna_generator import generate_mock_place_dna

logger = logging.getLogger(__name__)

router = APIRouter(tags=["place-dna"])


@router.get("/place-dna", response_model=PlaceDNAResponse)
def get_place_dna(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_m: int = Query(500, ge=100, le=2000),
    db: Session = Depends(get_db),
) -> PlaceDNAResponse:
    try:
        card = PlaceDNAResponse.model_validate(
            generate_mock_place_dna(
                lat=lat,
                lon=lon,
                radius_m=radius_m,
            )
        )
    except Exception as exc:
        logger.exception("PlaceDNA generation failed before database save")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate PlaceDNA card.",
        ) from exc

    try:
        card_id = save_place_card(db, card)
        return card.model_copy(update={"id": card_id})
    except Exception as exc:
        logger.exception("PlaceDNA generated but database save failed")
        return card.model_copy(update={"id": "unsaved"})
