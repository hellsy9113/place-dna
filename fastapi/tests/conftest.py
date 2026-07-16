import os

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://test:test@localhost/test",
)

import pytest
import httpx
from fastapi import HTTPException, Response
from fastapi.encoders import jsonable_encoder

from app.api.place_dna import get_place_dna
from app.schemas.place_dna import PlaceDNAResponse
from app.services.memory_card_cache import clear_memory_card_cache


class DummySession:
    def close(self) -> None:
        return None


class ASGITestClient:
    def __init__(self, db: DummySession) -> None:
        self.db = db

    def get(self, url: str, **kwargs) -> httpx.Response:
        if url != "/api/place-dna":
            raise AssertionError(f"Unsupported direct-test URL: {url}")

        params = kwargs.get("params", {})
        response = Response()
        force_refresh = str(params.get("force_refresh", "false")).lower() == "true"

        try:
            result = get_place_dna(
                response=response,
                lat=float(params["lat"]),
                lon=float(params["lon"]),
                radius_m=int(params.get("radius_m", 500)),
                force_refresh=force_refresh,
                db=self.db,
            )
        except HTTPException as exc:
            return httpx.Response(
                status_code=exc.status_code,
                json={"detail": jsonable_encoder(exc.detail)},
                headers=exc.headers,
            )

        return httpx.Response(
            status_code=200,
            json=jsonable_encoder(result),
            headers=dict(response.headers),
        )


@pytest.fixture(autouse=True)
def reset_memory_card_cache():
    clear_memory_card_cache()
    yield
    clear_memory_card_cache()


@pytest.fixture
def dummy_db() -> DummySession:
    return DummySession()


@pytest.fixture
def client(dummy_db: DummySession):
    yield ASGITestClient(dummy_db)


@pytest.fixture
def sample_card_payload():
    def build(**overrides):
        payload = {
            "id": None,
            "place_name": "Near India Gate",
            "title": "Balanced Urban Core",
            "rarity": "Rare",
            "region_type": "Urban Core",
            "stats": {
                "green_cover": 58,
                "population_pressure": 74,
                "built_up_density": 79,
                "water_access": 45,
                "connectivity": 88,
                "liveability": 63,
            },
            "traits": ["Urban", "Connected"],
            "description": "A dense urban zone with strong connectivity and moderate green cover.",
            "landmark": {
                "name": "India Gate",
                "distance_m": 120.0,
                "image_url": None,
                "source": "openstreetmap",
                "osm_type": "node",
                "osm_id": 123,
                "wikidata_id": "Q123",
            },
            "location": {
                "lat": 28.6129,
                "lon": 77.2295,
                "radius_m": 500,
            },
        }
        payload.update(overrides)
        return payload

    return build


@pytest.fixture
def sample_card_response(sample_card_payload):
    def build(**overrides) -> PlaceDNAResponse:
        return PlaceDNAResponse.model_validate(sample_card_payload(**overrides))

    return build
