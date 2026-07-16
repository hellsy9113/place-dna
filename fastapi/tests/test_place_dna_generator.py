from app.services import place_dna_generator


def test_basic_generation_does_not_call_external_landmark_lookup(monkeypatch) -> None:
    monkeypatch.setattr(
        place_dna_generator,
        "find_nearest_landmark",
        lambda *args, **kwargs: (_ for _ in ()).throw(
            AssertionError("external landmark lookup should not run")
        ),
    )

    card = place_dna_generator.generate_mock_place_dna(
        lat=28.6129,
        lon=77.2295,
        radius_m=500,
        use_external_landmark_lookup=False,
    )

    assert card["enrichment_status"] == "basic"
    assert card["enrichment_attempted_at"] is None
    assert card["landmark"] == {
        "name": "Landmark enrichment pending",
        "distance_m": None,
        "image_url": None,
        "source": None,
        "osm_type": None,
        "osm_id": None,
        "wikidata_id": None,
    }
