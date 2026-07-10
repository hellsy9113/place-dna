from __future__ import annotations

import logging
import random
from dataclasses import dataclass
from math import cos, pi, radians, sin, sqrt

from app.core.config import settings
from app.services.location_candidate_validator import SAFE_INDIA_REGIONS, validate_prewarm_candidate

logger = logging.getLogger(__name__)

URBAN_ANCHORS = [
    {"label": "Delhi", "lat": 28.6139, "lon": 77.2090, "jitter_km": 18},
    {"label": "Mumbai", "lat": 19.0760, "lon": 72.8777, "jitter_km": 18},
    {"label": "Bengaluru", "lat": 12.9716, "lon": 77.5946, "jitter_km": 16},
    {"label": "Hyderabad", "lat": 17.3850, "lon": 78.4867, "jitter_km": 16},
    {"label": "Chennai", "lat": 13.0827, "lon": 80.2707, "jitter_km": 16},
    {"label": "Kolkata", "lat": 22.5726, "lon": 88.3639, "jitter_km": 16},
    {"label": "Pune", "lat": 18.5204, "lon": 73.8567, "jitter_km": 14},
    {"label": "Ahmedabad", "lat": 23.0225, "lon": 72.5714, "jitter_km": 14},
    {"label": "Jaipur", "lat": 26.9124, "lon": 75.7873, "jitter_km": 14},
    {"label": "Lucknow", "lat": 26.8467, "lon": 80.9462, "jitter_km": 14},
    {"label": "Kochi", "lat": 9.9312, "lon": 76.2673, "jitter_km": 12},
    {"label": "Bhopal", "lat": 23.2599, "lon": 77.4126, "jitter_km": 12},
    {"label": "Indore", "lat": 22.7196, "lon": 75.8577, "jitter_km": 12},
    {"label": "Varanasi", "lat": 25.3176, "lon": 82.9739, "jitter_km": 10},
    {"label": "Guwahati", "lat": 26.1445, "lon": 91.7362, "jitter_km": 12},
]

TOURISM_NATURE_ANCHORS = [
    {"label": "Agra", "lat": 27.1767, "lon": 78.0081, "jitter_km": 12},
    {"label": "Udaipur", "lat": 24.5854, "lon": 73.7125, "jitter_km": 12},
    {"label": "Goa", "lat": 15.2993, "lon": 74.1240, "jitter_km": 20},
    {"label": "Mysuru", "lat": 12.2958, "lon": 76.6394, "jitter_km": 12},
    {"label": "Darjeeling", "lat": 27.0410, "lon": 88.2663, "jitter_km": 10},
    {"label": "Rishikesh", "lat": 30.0869, "lon": 78.2676, "jitter_km": 10},
    {"label": "Shimla", "lat": 31.1048, "lon": 77.1734, "jitter_km": 10},
    {"label": "Srinagar", "lat": 34.0837, "lon": 74.7973, "jitter_km": 10},
    {"label": "Hampi", "lat": 15.3350, "lon": 76.4600, "jitter_km": 8},
    {"label": "Kaziranga", "lat": 26.5775, "lon": 93.1711, "jitter_km": 12},
]

INDIA_REGION_BOXES = [dict(region) for region in SAFE_INDIA_REGIONS]

_CATEGORY_WEIGHTS = (
    ("urban", 0.70),
    ("tourism_nature", 0.20),
    ("wide_india", 0.10),
)


@dataclass(slots=True)
class PrewarmCandidate:
    label: str
    lat: float
    lon: float
    radius_m: int = 500
    source: str = "random"
    certainty_score: float | None = None


def random_point_near_anchor(
    lat: float,
    lon: float,
    max_distance_km: float,
    rng: random.Random | None = None,
) -> tuple[float, float]:
    generator = rng or random
    distance_km = max_distance_km * sqrt(generator.random())
    bearing = generator.uniform(0, 2 * pi)

    delta_lat = (distance_km * cos(bearing)) / 111.0
    cos_lat = max(cos(radians(lat)), 0.1)
    delta_lon = (distance_km * sin(bearing)) / (111.0 * cos_lat)

    return lat + delta_lat, lon + delta_lon


def generate_random_india_candidates(count: int) -> list[PrewarmCandidate]:
    if count <= 0:
        return []

    rng = random.Random(settings.prewarm_random_seed)
    candidates: list[PrewarmCandidate] = []
    attempts = 0
    max_attempts = count * 20

    while len(candidates) < count and attempts < max_attempts:
        attempts += 1
        candidate = _generate_one_candidate(rng)

        validation = validate_prewarm_candidate(candidate.lat, candidate.lon)
        if not validation.is_valid:
            logger.info(
                "Rejected random candidate lat=%s lon=%s reason=%s certainty=%s",
                candidate.lat,
                candidate.lon,
                validation.reason,
                validation.certainty_score,
            )
            continue

        candidate.certainty_score = validation.certainty_score
        logger.info(
            "Accepted random candidate label=%s certainty=%s",
            candidate.label,
            candidate.certainty_score,
        )
        candidates.append(candidate)

    return candidates


def _generate_one_candidate(rng: random.Random) -> PrewarmCandidate:
    category = _choose_category(rng)
    if category == "urban":
        return _urban_candidate(rng)
    if category == "tourism_nature":
        return _tourism_nature_candidate(rng)
    return _wide_india_candidate(rng)


def _choose_category(rng: random.Random) -> str:
    categories = [name for name, _ in _CATEGORY_WEIGHTS]
    weights = [weight for _, weight in _CATEGORY_WEIGHTS]
    return rng.choices(categories, weights=weights, k=1)[0]


def _urban_candidate(rng: random.Random) -> PrewarmCandidate:
    anchor = rng.choice(URBAN_ANCHORS)
    lat, lon = random_point_near_anchor(
        lat=anchor["lat"],
        lon=anchor["lon"],
        max_distance_km=anchor["jitter_km"],
        rng=rng,
    )
    return PrewarmCandidate(
        label=f"Random near {anchor['label']}",
        lat=_clamp_lat(lat),
        lon=_clamp_lon(lon),
        source="random_urban",
    )


def _tourism_nature_candidate(rng: random.Random) -> PrewarmCandidate:
    anchor = rng.choice(TOURISM_NATURE_ANCHORS)
    lat, lon = random_point_near_anchor(
        lat=anchor["lat"],
        lon=anchor["lon"],
        max_distance_km=anchor["jitter_km"],
        rng=rng,
    )
    return PrewarmCandidate(
        label=f"Random near {anchor['label']}",
        lat=_clamp_lat(lat),
        lon=_clamp_lon(lon),
        source="random_tourism_nature",
    )


def _wide_india_candidate(rng: random.Random) -> PrewarmCandidate:
    box = rng.choice(INDIA_REGION_BOXES)
    lat = rng.uniform(box["lat_min"], box["lat_max"])
    lon = rng.uniform(box["lon_min"], box["lon_max"])
    return PrewarmCandidate(
        label=f"Random in {box['label']}",
        lat=_clamp_lat(lat),
        lon=_clamp_lon(lon),
        source="random_wide_india",
    )


def _clamp_lat(lat: float) -> float:
    return max(-90.0, min(90.0, round(lat, 6)))


def _clamp_lon(lon: float) -> float:
    return max(-180.0, min(180.0, round(lon, 6)))
