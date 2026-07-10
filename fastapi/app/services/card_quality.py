from app.schemas.place_dna import PlaceDNAResponse

_VAGUE_LANDMARK_MARKERS = (
    "no major landmark",
    "unknown",
)


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
