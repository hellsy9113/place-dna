import os

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://test:test@localhost/test",
)

import pytest
from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app
from app.schemas.place_dna import PlaceDNAResponse


class DummySession:
    def close(self) -> None:
        return None


@pytest.fixture
def dummy_db() -> DummySession:
    return DummySession()


@pytest.fixture
def client(dummy_db: DummySession):
    def override_get_db():
        yield dummy_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


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
