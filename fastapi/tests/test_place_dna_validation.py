import pytest

from app.api import place_dna as place_dna_api


def test_invalid_coordinate_returns_clean_422_without_cache_or_generation(
    client,
    monkeypatch,
) -> None:
    def fail_cache_lookup(**kwargs):
        pytest.fail("cache lookup should not run for invalid coordinates")

    def fail_generation(**kwargs):
        pytest.fail("generation should not run for invalid coordinates")

    monkeypatch.setattr(place_dna_api, "find_cached_place_card", fail_cache_lookup)
    monkeypatch.setattr(place_dna_api, "generate_mock_place_dna", fail_generation)
    monkeypatch.setattr(place_dna_api.settings, "production_validate_clicks", True)
    monkeypatch.setattr(
        place_dna_api.settings,
        "production_skip_external_api_for_invalid_clicks",
        True,
    )

    response = client.get("/api/place-dna", params={"lat": -75, "lon": 20, "radius_m": 500})

    assert response.status_code == 422
    assert response.json()["detail"]["message"] == (
        "This location is outside the currently supported PlaceDNA coverage area."
    )


def test_valid_coordinate_is_not_rejected_and_generates_card(
    client,
    monkeypatch,
    sample_card_payload,
) -> None:
    monkeypatch.setattr(place_dna_api, "find_cached_place_card", lambda **kwargs: None)
    monkeypatch.setattr(place_dna_api, "save_place_card", lambda db, card: "card-123")
    monkeypatch.setattr(
        place_dna_api,
        "generate_mock_place_dna",
        lambda **kwargs: sample_card_payload(),
    )
    monkeypatch.setattr(place_dna_api.settings, "production_validate_clicks", True)
    monkeypatch.setattr(
        place_dna_api.settings,
        "production_skip_external_api_for_invalid_clicks",
        True,
    )

    response = client.get(
        "/api/place-dna",
        params={"lat": 28.6129, "lon": 77.2295, "radius_m": 500},
    )

    assert response.status_code == 200
    assert response.headers["X-PlaceDNA-Cache"] == "MISS"
    assert response.json()["id"] == "card-123"
