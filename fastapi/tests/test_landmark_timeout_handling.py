import httpx

from app.schemas.place_dna import PlaceDNAResponse
from app.services import landmark_service, prewarm_service
from app.services.random_india_sampler import PrewarmCandidate


class FakeClient:
    def __init__(self, *, post_effects=None, get_effects=None, **kwargs):
        self._post_effects = post_effects or []
        self._get_effects = get_effects or []
        self._post_index = 0
        self._get_index = 0

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def post(self, *args, **kwargs):
        if self._post_index >= len(self._post_effects):
            raise AssertionError("unexpected post call")
        effect = self._post_effects[self._post_index]
        self._post_index += 1
        if isinstance(effect, Exception):
            raise effect
        return effect


def test_normalize_image_url_rejects_non_http_values() -> None:
    assert landmark_service.normalize_image_url(None) is None
    assert landmark_service.normalize_image_url("") is None
    assert landmark_service.normalize_image_url("ftp://example.com/image.jpg") is None
    assert landmark_service.normalize_image_url(" https://example.com/image.jpg ") == (
        "https://example.com/image.jpg"
    )

    def get(self, *args, **kwargs):
        if self._get_index >= len(self._get_effects):
            raise AssertionError("unexpected get call")
        effect = self._get_effects[self._get_index]
        self._get_index += 1
        if isinstance(effect, Exception):
            raise effect
        return effect


def _configure_single_overpass_attempt(monkeypatch) -> None:
    monkeypatch.setattr(
        landmark_service,
        "_search_strategies",
        lambda radius_m: [{"radius_m": radius_m, "include_soft_categories": False}],
    )
    monkeypatch.setattr(
        landmark_service,
        "_overpass_urls",
        lambda: ["https://example.com/overpass"],
    )


def test_overpass_timeout_returns_fallback_landmark(monkeypatch) -> None:
    _configure_single_overpass_attempt(monkeypatch)
    monkeypatch.setattr(
        landmark_service.httpx,
        "Client",
        lambda *args, **kwargs: FakeClient(
            post_effects=[httpx.ReadTimeout("timed out")],
        ),
    )

    landmark = landmark_service.find_nearest_landmark(28.6129, 77.2295, radius_m=500)

    assert landmark["name"] == "No major landmark found nearby"
    assert landmark["distance_m"] is None


def test_overpass_429_returns_fallback_landmark(monkeypatch) -> None:
    _configure_single_overpass_attempt(monkeypatch)
    request = httpx.Request("POST", "https://example.com/overpass")
    response = httpx.Response(429, request=request)
    monkeypatch.setattr(
        landmark_service.httpx,
        "Client",
        lambda *args, **kwargs: FakeClient(post_effects=[response]),
    )

    landmark = landmark_service.find_nearest_landmark(28.6129, 77.2295, radius_m=500)

    assert landmark["name"] == "No major landmark found nearby"
    assert landmark["distance_m"] is None


def test_overpass_504_returns_fallback_landmark(monkeypatch) -> None:
    _configure_single_overpass_attempt(monkeypatch)
    request = httpx.Request("POST", "https://example.com/overpass")
    response = httpx.Response(504, request=request)
    monkeypatch.setattr(
        landmark_service.httpx,
        "Client",
        lambda *args, **kwargs: FakeClient(post_effects=[response]),
    )

    landmark = landmark_service.find_nearest_landmark(28.6129, 77.2295, radius_m=500)

    assert landmark["name"] == "No major landmark found nearby"
    assert landmark["distance_m"] is None


def test_unexpected_http_error_returns_fallback_landmark(monkeypatch) -> None:
    _configure_single_overpass_attempt(monkeypatch)
    monkeypatch.setattr(
        landmark_service.httpx,
        "Client",
        lambda *args, **kwargs: FakeClient(
            post_effects=[httpx.HTTPError("network down")],
        ),
    )

    landmark = landmark_service.find_nearest_landmark(28.6129, 77.2295, radius_m=500)

    assert landmark["name"] == "No major landmark found nearby"
    assert landmark["distance_m"] is None


def test_prewarm_continues_after_one_timeout_failure(
    monkeypatch,
    sample_card_payload,
) -> None:
    candidates = [
        PrewarmCandidate(label="Candidate A", lat=28.6129, lon=77.2295, source="test"),
        PrewarmCandidate(label="Candidate B", lat=19.0760, lon=72.8777, source="test"),
    ]
    generated = {"count": 0}

    class FakeSession:
        def close(self) -> None:
            return None

    def fake_generate_mock_place_dna(**kwargs):
        generated["count"] += 1
        if generated["count"] == 1:
            raise httpx.ReadTimeout("first candidate timed out")
        return sample_card_payload(
            place_name="Near Gateway of India",
            landmark={
                "name": "Gateway of India",
                "distance_m": 180.0,
                "image_url": None,
                "source": "openstreetmap",
                "osm_type": "node",
                "osm_id": 456,
                "wikidata_id": "Q456",
            },
            location={"lat": 19.0760, "lon": 72.8777, "radius_m": 500},
        )

    monkeypatch.setattr(prewarm_service, "build_prewarm_candidates", lambda: candidates)
    monkeypatch.setattr(prewarm_service, "SessionLocal", lambda: FakeSession())
    monkeypatch.setattr(prewarm_service, "find_cached_place_card", lambda **kwargs: None)
    monkeypatch.setattr(prewarm_service, "save_place_card", lambda db, card: "saved-card")
    monkeypatch.setattr(prewarm_service, "generate_mock_place_dna", fake_generate_mock_place_dna)
    monkeypatch.setattr(prewarm_service.settings, "prewarm_dry_run", False)
    monkeypatch.setattr(prewarm_service.settings, "prewarm_force_refresh", False)
    monkeypatch.setattr(prewarm_service.settings, "prewarm_sleep_seconds", 0)
    monkeypatch.setattr(prewarm_service.settings, "prewarm_validate_candidates", False)
    monkeypatch.setattr(prewarm_service.settings, "prewarm_skip_vague_cards", True)

    result = prewarm_service.run_prewarm_batch()

    assert result.total == 2
    assert result.failed == 1
    assert result.generated == 1
    assert result.cache_hits == 0
    assert result.skipped_invalid == 0
    assert result.skipped_vague == 0
