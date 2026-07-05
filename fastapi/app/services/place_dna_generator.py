import hashlib
from typing import Any

from app.services.landmark_service import find_nearest_landmark


def generate_mock_place_dna(lat: float, lon: float, radius_m: int) -> dict:
    rounded_lat = round(lat, 4)
    rounded_lon = round(lon, 4)
    digest = hashlib.sha256(f"{rounded_lat:.4f}:{rounded_lon:.4f}".encode("utf-8")).digest()

    green_cover = _score_from_digest(digest, 0)
    population_pressure = _score_from_digest(digest, 2)
    built_up_density = _score_from_digest(digest, 4)
    water_access = _score_from_digest(digest, 6)
    connectivity = _score_from_digest(digest, 8)
    landmark_signal = _score_from_digest(digest, 10)
    liveability = _compute_liveability(
        green_cover=green_cover,
        water_access=water_access,
        connectivity=connectivity,
        population_pressure=population_pressure,
        built_up_density=built_up_density,
    )

    stats = {
        "green_cover": green_cover,
        "population_pressure": population_pressure,
        "built_up_density": built_up_density,
        "water_access": water_access,
        "connectivity": connectivity,
        "liveability": liveability,
    }
    landmark = find_nearest_landmark(lat, lon, radius_m=radius_m)
    region_type = _determine_region_type(stats)
    rarity = _adjust_rarity_for_landmark(
        _determine_rarity(stats, landmark_signal),
        landmark,
        stats,
    )
    traits = _build_traits(stats, landmark)
    title = _build_title(region_type, rarity, traits)
    description = _build_description(region_type, stats)

    return {
        "place_name": _build_place_name(landmark),
        "title": title,
        "rarity": rarity,
        "region_type": region_type,
        "stats": stats,
        "traits": traits,
        "description": description,
        "landmark": _public_landmark(landmark),
        "location": {
            "lat": lat,
            "lon": lon,
            "radius_m": radius_m,
        },
    }


def _score_from_digest(digest: bytes, offset: int) -> int:
    return _pair_value(digest, offset) % 101


def _pair_value(digest: bytes, offset: int) -> int:
    return int.from_bytes(digest[offset : offset + 2], byteorder="big")


def _compute_liveability(
    *,
    green_cover: int,
    water_access: int,
    connectivity: int,
    population_pressure: int,
    built_up_density: int,
) -> int:
    raw_score = (
        0.30 * green_cover
        + 0.20 * water_access
        + 0.20 * connectivity
        - 0.15 * population_pressure
        - 0.15 * built_up_density
        + 40
    )
    return max(0, min(100, round(raw_score)))


def _determine_region_type(stats: dict[str, int]) -> str:
    green_cover = stats["green_cover"]
    population_pressure = stats["population_pressure"]
    built_up_density = stats["built_up_density"]
    water_access = stats["water_access"]

    if built_up_density >= 72 and population_pressure >= 68:
        return "Urban Core"
    if 40 <= built_up_density <= 70 and 40 <= population_pressure <= 70:
        return "Peri-Urban"
    if green_cover >= 72 and built_up_density <= 35:
        return "Green Zone"
    if built_up_density <= 40 and green_cover >= 55:
        return "Rural / Agricultural"
    if water_access >= 82:
        return "Waterfront"
    return "Mixed Region"


def _determine_rarity(stats: dict[str, int], landmark_signal: int) -> str:
    strong_stats = sum(score > 75 for score in stats.values())
    very_strong_stats = sum(score >= 88 for score in stats.values())

    if (
        stats["green_cover"] <= 25
        and stats["population_pressure"] >= 75
        and stats["built_up_density"] >= 75
        and stats["liveability"] <= 40
    ):
        return "Vulnerable"
    if landmark_signal >= 92 or (very_strong_stats >= 3 and strong_stats >= 4):
        return "Legendary"
    if strong_stats >= 3:
        return "Epic"
    if sum(score > 70 for score in stats.values()) >= 2:
        return "Rare"
    return "Common"


def _build_traits(stats: dict[str, int], landmark: dict[str, Any]) -> list[str]:
    traits: list[str] = []

    if stats["green_cover"] >= 70:
        traits.append("Green")
    if stats["built_up_density"] >= 70:
        traits.append("Dense")
    if stats["connectivity"] >= 70:
        traits.append("Connected")
    if stats["water_access"] >= 70:
        traits.append("Waterfront")
    if stats["built_up_density"] >= 70 or stats["population_pressure"] >= 70:
        traits.append("Urban")
    if stats["built_up_density"] <= 35 and stats["green_cover"] >= 55:
        traits.append("Rural")
    if stats["population_pressure"] >= 75:
        traits.append("High Pressure")
    if 45 <= stats["liveability"] <= 70:
        traits.append("Balanced")
    if stats["liveability"] <= 40:
        traits.append("Low Comfort")
    if landmark.get("is_real"):
        traits.append("Landmark")
    if landmark.get("historic"):
        traits.append("Heritage")

    if not traits:
        traits.append("Balanced")

    return list(dict.fromkeys(traits))


def _build_title(region_type: str, rarity: str, traits: list[str]) -> str:
    lead = "Balanced"
    if rarity == "Vulnerable":
        lead = "High Pressure"
    elif "Waterfront" in traits and region_type != "Waterfront":
        lead = "Waterfront"
    elif "Green" in traits:
        lead = "Green"
    elif "Dense" in traits:
        lead = "Dense"
    elif "Connected" in traits:
        lead = "Connected"

    base_titles = {
        "Urban Core": "Urban Core",
        "Peri-Urban": "Peri-Urban Belt",
        "Green Zone": "Green Pocket",
        "Rural / Agricultural": "Rural Pocket",
        "Waterfront": "Waterfront Reach",
        "Mixed Region": "Mixed Zone",
    }
    return f"{lead} {base_titles[region_type]}"


def _build_description(region_type: str, stats: dict[str, int]) -> str:
    green_phrase = _band_label(stats["green_cover"], high="strong", medium="moderate", low="limited")
    connectivity_phrase = _band_label(
        stats["connectivity"], high="strong", medium="steady", low="weaker"
    )
    pressure_phrase = _band_label(
        stats["population_pressure"], high="high population pressure", medium="moderate pressure", low="lighter pressure"
    )
    region_phrases = {
        "Urban Core": "dense urban zone",
        "Peri-Urban": "peri-urban transition zone",
        "Green Zone": "green landscape pocket",
        "Rural / Agricultural": "rural agricultural area",
        "Waterfront": "waterfront corridor",
        "Mixed Region": "mixed regional patch",
    }

    return (
        f"A {region_phrases[region_type]} with {connectivity_phrase} connectivity, "
        f"{green_phrase} green cover, and {pressure_phrase}."
    )


def _band_label(value: int, *, high: str, medium: str, low: str) -> str:
    if value >= 70:
        return high
    if value >= 40:
        return medium
    return low


def _build_place_name(landmark: dict[str, Any]) -> str:
    if landmark.get("is_real") and landmark.get("name"):
        return f"Near {landmark['name']}"
    return "Generated Place"


def _adjust_rarity_for_landmark(
    rarity: str,
    landmark: dict[str, Any],
    stats: dict[str, int],
) -> str:
    if not (landmark.get("historic") or landmark.get("tourism")):
        return rarity

    strong_stats = sum(score > 75 for score in stats.values())
    if rarity == "Common":
        return "Rare"
    if rarity == "Rare":
        return "Epic"
    if rarity == "Epic" and strong_stats >= 3:
        return "Legendary"
    return rarity


def _public_landmark(landmark: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": landmark["name"],
        "distance_m": landmark["distance_m"],
        "image_url": landmark["image_url"],
        "source": landmark["source"],
        "osm_type": landmark["osm_type"],
        "osm_id": landmark["osm_id"],
        "wikidata_id": landmark["wikidata_id"],
    }
