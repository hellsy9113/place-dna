from __future__ import annotations

import json
import logging
import time
from dataclasses import asdict, dataclass
from pathlib import Path

from app.core.config import settings
from app.db.session import SessionLocal
from app.repositories.place_cards_repository import find_cached_place_card, save_place_card
from app.schemas.place_dna import PlaceDNAResponse
from app.services.location_candidate_validator import validate_prewarm_candidate
from app.services.place_dna_generator import generate_mock_place_dna
from app.services.random_india_sampler import PrewarmCandidate, generate_random_india_candidates

logger = logging.getLogger(__name__)

_SEED_LOCATIONS_PATH = Path(__file__).resolve().parent.parent / "data" / "seed_locations.json"
_VAGUE_LANDMARK_MARKERS = (
    "no major landmark",
    "unknown",
)


@dataclass(slots=True)
class PrewarmResult:
    total: int = 0
    cache_hits: int = 0
    generated: int = 0
    failed: int = 0
    skipped_invalid: int = 0


def load_fixed_seed_candidates() -> list[PrewarmCandidate]:
    if not _SEED_LOCATIONS_PATH.exists():
        logger.warning("Fixed seed file not found at %s", _SEED_LOCATIONS_PATH)
        return []

    with _SEED_LOCATIONS_PATH.open("r", encoding="utf-8") as seed_file:
        payload = json.load(seed_file)

    if not isinstance(payload, list):
        raise ValueError("seed_locations.json must contain a list")

    candidates: list[PrewarmCandidate] = []
    for entry in payload:
        if not isinstance(entry, dict):
            continue

        candidates.append(
            PrewarmCandidate(
                label=str(entry["label"]),
                lat=float(entry["lat"]),
                lon=float(entry["lon"]),
                radius_m=int(entry.get("radius_m", 500)),
                source=str(entry.get("source", "fixed_seed")),
            )
        )

    return candidates


def build_prewarm_candidates() -> list[PrewarmCandidate]:
    candidates: list[PrewarmCandidate] = []

    if settings.prewarm_enable_fixed_seeds:
        candidates.extend(load_fixed_seed_candidates())

    if settings.prewarm_enable_random_india:
        candidates.extend(generate_random_india_candidates(settings.prewarm_random_count))

    if settings.prewarm_batch_size > 0:
        return candidates[: settings.prewarm_batch_size]
    return candidates


def is_generated_card_useful_for_cache(card: PlaceDNAResponse) -> bool:
    landmark_name = (card.landmark.name or "").strip()
    description = (card.description or "").strip()
    region_type = (card.region_type or "").strip()
    rarity = (card.rarity or "").strip()

    if not landmark_name or not description or not region_type or not rarity:
        return False

    lowered_landmark = landmark_name.lower()
    if any(marker in lowered_landmark for marker in _VAGUE_LANDMARK_MARKERS):
        return False

    return True


def run_prewarm_batch() -> PrewarmResult:
    candidates = build_prewarm_candidates()
    result = PrewarmResult(total=len(candidates))

    logger.info("Starting prewarm batch with %s candidates", len(candidates))

    db = SessionLocal()
    try:
        for candidate in candidates:
            logger.info(
                "Prewarm candidate: %s source=%s lat=%s lon=%s certainty=%s",
                candidate.label,
                candidate.source,
                candidate.lat,
                candidate.lon,
                candidate.certainty_score,
            )

            try:
                if settings.prewarm_validate_candidates:
                    validation = validate_prewarm_candidate(candidate.lat, candidate.lon)
                    if not validation.is_valid:
                        logger.info(
                            "Skipping candidate label=%s reason=%s certainty=%s",
                            candidate.label,
                            validation.reason,
                            validation.certainty_score,
                        )
                        result.skipped_invalid += 1
                        continue

                    if candidate.certainty_score is None:
                        candidate.certainty_score = validation.certainty_score

                if not settings.prewarm_force_refresh:
                    try:
                        cached_card = find_cached_place_card(
                            db=db,
                            lat=candidate.lat,
                            lon=candidate.lon,
                            cache_distance_m=settings.prewarm_cache_distance_m,
                            max_age_days=settings.prewarm_max_age_days,
                        )
                    except Exception:
                        logger.exception(
                            "Prewarm cache lookup failed for %s source=%s",
                            candidate.label,
                            candidate.source,
                        )
                        cached_card = None

                    if cached_card is not None:
                        result.cache_hits += 1
                        logger.info("Cache hit: %s source=%s", candidate.label, candidate.source)
                        continue

                    logger.info("Cache miss: %s source=%s", candidate.label, candidate.source)
                else:
                    logger.info("Force refresh enabled for %s source=%s", candidate.label, candidate.source)

                if settings.prewarm_dry_run:
                    logger.info("Dry run enabled, skipping generation for %s", candidate.label)
                    continue

                try:
                    card = PlaceDNAResponse.model_validate(
                        generate_mock_place_dna(
                            lat=candidate.lat,
                            lon=candidate.lon,
                            radius_m=candidate.radius_m,
                        )
                    )
                except Exception:
                    result.failed += 1
                    logger.exception(
                        "Failed to generate card for candidate label=%s",
                        candidate.label,
                    )
                    continue

                if settings.prewarm_skip_vague_cards and not is_generated_card_useful_for_cache(card):
                    result.skipped_invalid += 1
                    logger.info(
                        "Generated card skipped because landmark result was vague label=%s",
                        candidate.label,
                    )
                    continue

                try:
                    save_place_card(db, card)
                except Exception:
                    result.failed += 1
                    logger.exception(
                        "Failed to save card for %s source=%s",
                        candidate.label,
                        candidate.source,
                    )
                    continue

                result.generated += 1
                logger.info("Generated card for %s source=%s", candidate.label, candidate.source)

                if settings.prewarm_sleep_seconds > 0:
                    time.sleep(settings.prewarm_sleep_seconds)
            except Exception:
                result.failed += 1
                logger.exception(
                    "Failed to process prewarm candidate label=%s source=%s",
                    candidate.label,
                    candidate.source,
                )
                continue
    finally:
        db.close()

    logger.info("Prewarm summary: %s", asdict(result))
    return result
