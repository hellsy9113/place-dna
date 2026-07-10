from app.api import place_dna as place_dna_api


def test_cache_hit_returns_cached_card_and_skips_generator(
    client,
    monkeypatch,
    sample_card_response,
) -> None:
    monkeypatch.setattr(
        place_dna_api,
        "find_cached_place_card",
        lambda **kwargs: sample_card_response(id="cached-card"),
    )
    monkeypatch.setattr(
        place_dna_api,
        "generate_mock_place_dna",
        lambda **kwargs: (_ for _ in ()).throw(AssertionError("generator should not run")),
    )
    monkeypatch.setattr(
        place_dna_api,
        "save_place_card",
        lambda db, card: (_ for _ in ()).throw(AssertionError("save should not run")),
    )

    response = client.get(
        "/api/place-dna",
        params={"lat": 28.6129, "lon": 77.2295, "radius_m": 500},
    )

    assert response.status_code == 200
    assert response.headers["X-PlaceDNA-Cache"] == "HIT"
    assert response.json()["id"] == "cached-card"


def test_cache_miss_generates_and_saves_card(
    client,
    monkeypatch,
    sample_card_payload,
) -> None:
    saved = {}

    monkeypatch.setattr(place_dna_api, "find_cached_place_card", lambda **kwargs: None)
    monkeypatch.setattr(
        place_dna_api,
        "generate_mock_place_dna",
        lambda **kwargs: sample_card_payload(),
    )

    def fake_save(db, card):
        saved["card"] = card
        return "generated-card"

    monkeypatch.setattr(place_dna_api, "save_place_card", fake_save)

    response = client.get(
        "/api/place-dna",
        params={"lat": 28.6129, "lon": 77.2295, "radius_m": 500},
    )

    assert response.status_code == 200
    assert response.headers["X-PlaceDNA-Cache"] == "MISS"
    assert response.json()["id"] == "generated-card"
    assert saved["card"].place_name == "Near India Gate"


def test_force_refresh_skips_cache_lookup_even_if_cache_exists(
    client,
    monkeypatch,
    sample_card_payload,
) -> None:
    monkeypatch.setattr(
        place_dna_api,
        "find_cached_place_card",
        lambda **kwargs: (_ for _ in ()).throw(AssertionError("cache lookup should be skipped")),
    )
    monkeypatch.setattr(
        place_dna_api,
        "generate_mock_place_dna",
        lambda **kwargs: sample_card_payload(),
    )
    monkeypatch.setattr(place_dna_api, "save_place_card", lambda db, card: "forced-card")

    response = client.get(
        "/api/place-dna",
        params={
            "lat": 28.6129,
            "lon": 77.2295,
            "radius_m": 500,
            "force_refresh": "true",
        },
    )

    assert response.status_code == 200
    assert response.headers["X-PlaceDNA-Cache"] == "MISS"
    assert response.json()["id"] == "forced-card"


def test_vague_generated_card_is_returned_but_not_saved(
    client,
    monkeypatch,
    sample_card_payload,
) -> None:
    vague_landmark = {
        "name": "No major landmark found nearby",
        "distance_m": None,
        "image_url": None,
        "source": None,
        "osm_type": None,
        "osm_id": None,
        "wikidata_id": None,
    }
    generated_payload = sample_card_payload(
        place_name="Generated Place",
        landmark=vague_landmark,
    )

    monkeypatch.setattr(place_dna_api, "find_cached_place_card", lambda **kwargs: None)
    monkeypatch.setattr(
        place_dna_api,
        "generate_mock_place_dna",
        lambda **kwargs: generated_payload,
    )
    monkeypatch.setattr(
        place_dna_api,
        "save_place_card",
        lambda db, card: (_ for _ in ()).throw(AssertionError("vague card should not be saved")),
    )

    response = client.get(
        "/api/place-dna",
        params={"lat": 28.6129, "lon": 77.2295, "radius_m": 500},
    )

    assert response.status_code == 200
    assert response.headers["X-PlaceDNA-Cache"] == "MISS"
    assert response.json()["id"] == "unsaved"


def test_cache_lookup_failure_logs_and_still_generates_valid_card(
    client,
    monkeypatch,
    sample_card_payload,
) -> None:
    monkeypatch.setattr(
        place_dna_api,
        "find_cached_place_card",
        lambda **kwargs: (_ for _ in ()).throw(RuntimeError("db unavailable")),
    )
    monkeypatch.setattr(
        place_dna_api,
        "generate_mock_place_dna",
        lambda **kwargs: sample_card_payload(),
    )
    monkeypatch.setattr(place_dna_api, "save_place_card", lambda db, card: "recovered-card")

    response = client.get(
        "/api/place-dna",
        params={"lat": 28.6129, "lon": 77.2295, "radius_m": 500},
    )

    assert response.status_code == 200
    assert response.headers["X-PlaceDNA-Cache"] == "MISS"
    assert response.json()["id"] == "recovered-card"
