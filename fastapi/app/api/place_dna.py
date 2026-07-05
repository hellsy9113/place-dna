import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.place_cards_repository import save_place_card
from app.schemas.place_dna import PlaceDNAResponse
from app.services.place_dna_generator import generate_mock_place_dna

router = APIRouter(tags=["place-dna"])


@router.get("/place-dna", response_model=PlaceDNAResponse)
def get_place_dna(
    lat: str = Query(...),
    lon: str = Query(...),
    radius_m: str = Query("500"),
    db: Session = Depends(get_db),
) -> PlaceDNAResponse:
    parsed_lat = _parse_float(lat, "lat", minimum=-90, maximum=90)
    parsed_lon = _parse_float(lon, "lon", minimum=-180, maximum=180)
    parsed_radius = _parse_int(radius_m, "radius_m", minimum=100, maximum=2000)

    card = PlaceDNAResponse.model_validate(
        generate_mock_place_dna(parsed_lat, parsed_lon, parsed_radius)
    )
    card_id = save_place_card(db, card)
    return PlaceDNAResponse.model_validate({**card.model_dump(), "id": card_id})


def _parse_float(raw_value: str, field_name: str, *, minimum: float, maximum: float) -> float:
    try:
        value = float(raw_value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be a valid number.",
        ) from exc

    if not math.isfinite(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be a finite number.",
        )
    if not minimum <= value <= maximum:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be between {minimum} and {maximum}.",
        )
    return value


def _parse_int(raw_value: str, field_name: str, *, minimum: int, maximum: int) -> int:
    try:
        value = int(raw_value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be a valid integer.",
        ) from exc

    if not minimum <= value <= maximum:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be between {minimum} and {maximum}.",
        )
    return value
