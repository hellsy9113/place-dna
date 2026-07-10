from __future__ import annotations

from dataclasses import dataclass
from math import sqrt

from app.core.config import settings

INDIA_BOUNDS = {
    "lat_min": 6.0,
    "lat_max": 37.5,
    "lon_min": 68.0,
    "lon_max": 97.5,
}

SAFE_INDIA_REGIONS = [
    {
        "label": "North India",
        "lat_min": 26.0,
        "lat_max": 31.5,
        "lon_min": 74.0,
        "lon_max": 84.0,
    },
    {
        "label": "West India",
        "lat_min": 18.0,
        "lat_max": 24.5,
        "lon_min": 70.5,
        "lon_max": 78.0,
    },
    {
        "label": "South India",
        "lat_min": 8.5,
        "lat_max": 18.0,
        "lon_min": 74.0,
        "lon_max": 82.0,
    },
    {
        "label": "Central India",
        "lat_min": 18.0,
        "lat_max": 25.5,
        "lon_min": 76.0,
        "lon_max": 84.0,
    },
    {
        "label": "East India",
        "lat_min": 20.0,
        "lat_max": 27.0,
        "lon_min": 84.0,
        "lon_max": 89.5,
    },
    {
        "label": "Northeast India",
        "lat_min": 24.0,
        "lat_max": 28.5,
        "lon_min": 90.0,
        "lon_max": 95.5,
    },
]

WATER_EXCLUSION_ZONES = [
    {
        "label": "Arabian Sea west of Gujarat/Maharashtra",
        "lat_min": 8.0,
        "lat_max": 24.5,
        "lon_min": 68.0,
        "lon_max": 70.5,
    },
    {
        "label": "Bay of Bengal east coast water",
        "lat_min": 8.0,
        "lat_max": 22.5,
        "lon_min": 82.5,
        "lon_max": 89.5,
    },
    {
        "label": "Indian Ocean south of mainland India",
        "lat_min": 5.5,
        "lat_max": 8.5,
        "lon_min": 72.0,
        "lon_max": 82.0,
    },
]

AMBIGUOUS_EXCLUSION_ZONES = [
    {
        "label": "Far northwest border-sensitive area",
        "lat_min": 31.0,
        "lat_max": 37.5,
        "lon_min": 68.0,
        "lon_max": 76.5,
    },
    {
        "label": "High Himalaya sparse/border-sensitive area",
        "lat_min": 31.0,
        "lat_max": 37.5,
        "lon_min": 76.5,
        "lon_max": 85.5,
    },
    {
        "label": "Far northeast border-sensitive edge",
        "lat_min": 27.5,
        "lat_max": 30.0,
        "lon_min": 92.0,
        "lon_max": 97.5,
    },
]

KNOWN_CONTEXT_ANCHORS = [
    (28.6139, 77.2090),
    (19.0760, 72.8777),
    (12.9716, 77.5946),
    (17.3850, 78.4867),
    (13.0827, 80.2707),
    (22.5726, 88.3639),
    (27.1767, 78.0081),
    (15.2993, 74.1240),
    (26.5775, 93.1711),
]

MIN_CERTAINTY_SCORE = 0.65


@dataclass(slots=True)
class CandidateValidationResult:
    is_valid: bool
    reason: str
    certainty_score: float


def validate_prewarm_candidate(lat: float, lon: float) -> CandidateValidationResult:
    if lat < -90 or lat > 90 or lon < -180 or lon > 180 or lat < -60:
        return CandidateValidationResult(
            is_valid=False,
            reason="Invalid or unsupported global coordinate",
            certainty_score=0.0,
        )

    if not _point_in_box(lat, lon, INDIA_BOUNDS):
        return CandidateValidationResult(
            is_valid=False,
            reason="Outside broad India bounds",
            certainty_score=0.0,
        )

    if any(_point_in_box(lat, lon, zone) for zone in WATER_EXCLUSION_ZONES):
        return CandidateValidationResult(
            is_valid=False,
            reason="Candidate appears to be in ocean/sea exclusion zone",
            certainty_score=0.2,
        )

    if any(_point_in_box(lat, lon, zone) for zone in AMBIGUOUS_EXCLUSION_ZONES):
        return CandidateValidationResult(
            is_valid=False,
            reason="Candidate in ambiguous or low-certainty border region",
            certainty_score=0.4,
        )

    if not any(_point_in_box(lat, lon, region) for region in SAFE_INDIA_REGIONS):
        return CandidateValidationResult(
            is_valid=False,
            reason="Candidate outside safe India land-biased regions",
            certainty_score=0.3,
        )

    certainty_score = calculate_candidate_certainty(lat, lon)
    threshold = max(0.0, min(1.0, settings.prewarm_min_certainty_score))
    if certainty_score < threshold:
        return CandidateValidationResult(
            is_valid=False,
            reason="Candidate certainty score too low",
            certainty_score=certainty_score,
        )

    return CandidateValidationResult(
        is_valid=True,
        reason="Candidate accepted",
        certainty_score=certainty_score,
    )


def calculate_candidate_certainty(lat: float, lon: float) -> float:
    score = 1.0

    if _distance_to_box_edge_deg(lat, lon, INDIA_BOUNDS) < 1.0:
        score -= 0.25

    if _distance_to_nearest_box_deg(lat, lon, WATER_EXCLUSION_ZONES) < 0.75:
        score -= 0.30

    if _distance_to_nearest_box_deg(lat, lon, AMBIGUOUS_EXCLUSION_ZONES) < 0.75:
        score -= 0.40

    if _distance_to_nearest_anchor_km(lat, lon) > 250:
        score -= 0.20

    return max(0.0, min(1.0, score))


def _point_in_box(lat: float, lon: float, box: dict[str, float]) -> bool:
    return (
        box["lat_min"] <= lat <= box["lat_max"]
        and box["lon_min"] <= lon <= box["lon_max"]
    )


def _distance_to_box_edge_deg(lat: float, lon: float, box: dict[str, float]) -> float:
    return min(
        abs(lat - box["lat_min"]),
        abs(box["lat_max"] - lat),
        abs(lon - box["lon_min"]),
        abs(box["lon_max"] - lon),
    )


def _distance_to_nearest_box_deg(
    lat: float,
    lon: float,
    boxes: list[dict[str, float]],
) -> float:
    return min(_distance_to_box_deg(lat, lon, box) for box in boxes)


def _distance_to_box_deg(lat: float, lon: float, box: dict[str, float]) -> float:
    lat_delta = max(box["lat_min"] - lat, 0.0, lat - box["lat_max"])
    lon_delta = max(box["lon_min"] - lon, 0.0, lon - box["lon_max"])
    return sqrt((lat_delta ** 2) + (lon_delta ** 2))


def _distance_to_nearest_anchor_km(lat: float, lon: float) -> float:
    distances = [
        sqrt(((lat - anchor_lat) * 111.0) ** 2 + ((lon - anchor_lon) * 111.0) ** 2)
        for anchor_lat, anchor_lon in KNOWN_CONTEXT_ANCHORS
    ]
    return min(distances)
