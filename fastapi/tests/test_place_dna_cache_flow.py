from app.api import place_dna as place_dna_api
from app.services.memory_card_cache import set_memory_cached_card


def test_memory_cache_hit_skips_database_and_generator(
    client,
    monkeypatch,
    sample_card_response,
) -> None:
    cached_card = sample_card_response(id="memory-card")
    set_memory_cached_card(
        lat=28.6129,
        lon=77.2295,
        radius_m=500,
        card=cached_card,
    )
    monkeypatch.setattr(
        place_dna_api,
        "find_cached_place_card",
        lambda **kwargs: (_ for _ in ()).throw(AssertionError("database should not run")),
    )
    monkeypatch.setattr(
        place_dna_api,
        "generate_mock_place_dna",
        lambda **kwargs: (_ for _ in ()).throw(AssertionError("generator should not run")),
    )

    response = client.get(
        "/api/place-dna",
        params={"lat": 28.6129, "lon": 77.2295, "radius_m": 500},
    )

    assert response.status_code == 200
    assert response.headers["X-PlaceDNA-Cache"] == "HIT"
    assert response.headers["X-PlaceDNA-Cache-Tier"] == "MEMORY"
    assert response.json()["id"] == "memory-card"


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
        place_dna_api.settings,
        "production_use_external_landmark_lookup",
        True,
    )
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


def test_production_generation_disables_external_landmark_lookup(
    client,
    monkeypatch,
    sample_card_payload,
) -> None:
    generation_options = {}
    pending_landmark = {
        "name": "Landmark enrichment pending",
        "distance_m": None,
        "image_url": None,
        "source": None,
        "osm_type": None,
        "osm_id": None,
        "wikidata_id": None,
    }

    def fake_generate(**kwargs):
        generation_options.update(kwargs)
        return sample_card_payload(
            place_name="Generated Place",
            landmark=pending_landmark,
            enrichment_status="basic",
        )

    monkeypatch.setattr(place_dna_api, "find_cached_place_card", lambda **kwargs: None)
    monkeypatch.setattr(place_dna_api, "generate_mock_place_dna", fake_generate)
    monkeypatch.setattr(place_dna_api, "save_place_card", lambda db, card: "basic-card")
    monkeypatch.setattr(
        place_dna_api.settings,
        "production_use_external_landmark_lookup",
        False,
    )

    response = client.get(
        "/api/place-dna",
        params={"lat": 28.6129, "lon": 77.2295, "radius_m": 500},
    )

    assert response.status_code == 200
    assert generation_options["use_external_landmark_lookup"] is False
    assert response.json()["enrichment_status"] == "basic"


def test_basic_card_is_saved_with_basic_status(
    client,
    monkeypatch,
    sample_card_payload,
) -> None:
    saved = {}
    pending_landmark = {
        "name": "Landmark enrichment pending",
        "distance_m": None,
        "image_url": None,
        "source": None,
        "osm_type": None,
        "osm_id": None,
        "wikidata_id": None,
    }
    generated_payload = sample_card_payload(
        place_name="Generated Place",
        landmark=pending_landmark,
        enrichment_status="basic",
    )

    monkeypatch.setattr(place_dna_api, "find_cached_place_card", lambda **kwargs: None)
    monkeypatch.setattr(
        place_dna_api,
        "generate_mock_place_dna",
        lambda **kwargs: generated_payload,
    )

    def fake_save(db, card):
        saved["status"] = card.enrichment_status
        return "basic-card"

    monkeypatch.setattr(place_dna_api, "save_place_card", fake_save)
    monkeypatch.setattr(
        place_dna_api.settings,
        "production_use_external_landmark_lookup",
        False,
    )

    response = client.get(
        "/api/place-dna",
        params={"lat": 28.6129, "lon": 77.2295, "radius_m": 500},
    )

    assert response.status_code == 200
    assert response.json()["id"] == "basic-card"
    assert saved["status"] == "basic"


def test_database_save_failure_returns_unsaved_card(
    client,
    monkeypatch,
    sample_card_payload,
) -> None:
    monkeypatch.setattr(place_dna_api, "find_cached_place_card", lambda **kwargs: None)
    monkeypatch.setattr(
        place_dna_api,
        "generate_mock_place_dna",
        lambda **kwargs: sample_card_payload(enrichment_status="basic"),
    )
    monkeypatch.setattr(
        place_dna_api,
        "save_place_card",
        lambda db, card: (_ for _ in ()).throw(RuntimeError("write failed")),
    )

    response = client.get(
        "/api/place-dna",
        params={"lat": 28.6129, "lon": 77.2295, "radius_m": 500},
    )

    assert response.status_code == 200
    assert response.json()["id"] == "unsaved"
    assert response.json()["enrichment_status"] == "basic"
