import pytest

from app.services.location_candidate_validator import (
    validate_prewarm_candidate,
    validate_production_click,
)


@pytest.mark.parametrize(
    ("lat", "lon"),
    [
        (-75.0, 20.0),
        (48.8566, 2.3522),
        (15.0, 65.0),
        (5.0, 78.0),
        (0.0, -140.0),
    ],
)
def test_production_validation_rejects_invalid_or_unsupported_points(lat: float, lon: float) -> None:
    result = validate_production_click(lat, lon)

    assert result.is_valid is False
    assert result.certainty_score <= 0.2


@pytest.mark.parametrize(
    ("lat", "lon"),
    [
        (28.6129, 77.2295),
        (18.9218, 72.8347),
        (12.9716, 77.5946),
        (17.3850, 78.4867),
        (22.5726, 88.3639),
        (13.0827, 80.2707),
    ],
)
def test_production_validation_allows_supported_indian_city_clicks(lat: float, lon: float) -> None:
    result = validate_production_click(lat, lon)

    assert result.is_valid is True
    assert result.certainty_score >= 0.5


def test_prewarm_validation_is_stricter_than_production_validation() -> None:
    lat = 30.8
    lon = 88.8

    production_result = validate_production_click(lat, lon)
    prewarm_result = validate_prewarm_candidate(lat, lon)

    assert production_result.is_valid is True
    assert prewarm_result.is_valid is False
    assert "safe India land-biased regions" in prewarm_result.reason
