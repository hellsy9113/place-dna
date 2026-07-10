import logging
import math
import re
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_REQUEST_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "PlaceDNA/0.1",
}
_DEFAULT_OVERPASS_URL = "https://overpass-api.de/api/interpreter"
_FALLBACK_OVERPASS_URLS = [
    "https://z.overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
]


def _landmark_lookup_timeout() -> httpx.Timeout:
    return httpx.Timeout(
        timeout=settings.landmark_lookup_timeout_seconds,
        connect=settings.landmark_lookup_connect_timeout_seconds,
        read=settings.landmark_lookup_read_timeout_seconds,
        write=settings.landmark_lookup_write_timeout_seconds,
        pool=settings.landmark_lookup_pool_timeout_seconds,
    )


def _overpass_query_timeout_seconds() -> int:
    return max(1, math.ceil(settings.landmark_lookup_timeout_seconds))


def find_nearest_landmark(lat: float, lon: float, radius_m: int = 1000) -> dict[str, Any]:
    fallback = _fallback_landmark()
    candidates: list[dict[str, Any]] = []

    for strategy in _search_strategies(radius_m):
        logger.info(
            "Starting Overpass landmark lookup for lat=%s lon=%s radius_m=%s include_soft_categories=%s",
            lat,
            lon,
            strategy["radius_m"],
            strategy["include_soft_categories"],
        )
        elements = _query_overpass_elements(
            lat,
            lon,
            radius_m=strategy["radius_m"],
            include_soft_categories=strategy["include_soft_categories"],
        )
        if not elements:
            continue

        candidates = _build_candidates(elements, lat, lon)
        if candidates:
            break

    if not candidates:
        logger.info("No landmarks found near lat=%s lon=%s", lat, lon)
        return fallback

    candidates = _rank_candidates(candidates)
    _enrich_top_candidates_with_images(candidates)
    candidates = _rank_candidates(candidates)

    best_candidate = _select_best_candidate(candidates)

    landmark = _to_landmark_response(best_candidate)
    logger.info(
        "Selected landmark %s at %.1fm for lat=%s lon=%s",
        landmark["name"],
        best_candidate["distance_m"],
        lat,
        lon,
    )
    return landmark


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_radius_m = 6_371_000
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return earth_radius_m * c


def _build_overpass_query(lat: float, lon: float, radius_m: int) -> str:
    return _build_overpass_query_with_categories(
        lat=lat,
        lon=lon,
        radius_m=radius_m,
        include_soft_categories=True,
    )


def _build_overpass_query_with_categories(
    *,
    lat: float,
    lon: float,
    radius_m: int,
    include_soft_categories: bool,
) -> str:
    soft_category_block = ""
    if include_soft_categories:
        soft_category_block = f"""

  node(around:{radius_m},{lat},{lon})["leisure"="park"];
  way(around:{radius_m},{lat},{lon})["leisure"="park"];
  relation(around:{radius_m},{lat},{lon})["leisure"="park"];

  node(around:{radius_m},{lat},{lon})["natural"="water"];
  way(around:{radius_m},{lat},{lon})["natural"="water"];
  relation(around:{radius_m},{lat},{lon})["natural"="water"];

  node(around:{radius_m},{lat},{lon})["waterway"="river"];
  way(around:{radius_m},{lat},{lon})["waterway"="river"];
  relation(around:{radius_m},{lat},{lon})["waterway"="river"];
"""

    return f"""
[out:json][timeout:{_overpass_query_timeout_seconds()}];
(
  node(around:{radius_m},{lat},{lon})["tourism"];
  way(around:{radius_m},{lat},{lon})["tourism"];
  relation(around:{radius_m},{lat},{lon})["tourism"];

  node(around:{radius_m},{lat},{lon})["historic"];
  way(around:{radius_m},{lat},{lon})["historic"];
  relation(around:{radius_m},{lat},{lon})["historic"];

  node(around:{radius_m},{lat},{lon})["amenity"="place_of_worship"];
  way(around:{radius_m},{lat},{lon})["amenity"="place_of_worship"];
  relation(around:{radius_m},{lat},{lon})["amenity"="place_of_worship"];
{soft_category_block}
);
out center tags;
""".strip()


def _query_overpass_elements(
    lat: float,
    lon: float,
    *,
    radius_m: int,
    include_soft_categories: bool,
) -> list[dict[str, Any]]:
    query = _build_overpass_query_with_categories(
        lat=lat,
        lon=lon,
        radius_m=radius_m,
        include_soft_categories=include_soft_categories,
    )
    timeout = _landmark_lookup_timeout()

    for overpass_url in _overpass_urls():
        try:
            with httpx.Client(timeout=timeout, headers=_REQUEST_HEADERS) as client:
                response = client.post(
                    overpass_url,
                    data={"data": query},
                )
                response.raise_for_status()
                payload = response.json()
        except httpx.TimeoutException:
            logger.warning(
                "Overpass landmark lookup timed out via=%s lat=%s lon=%s radius_m=%s",
                overpass_url,
                lat,
                lon,
                radius_m,
            )
            continue
        except httpx.HTTPStatusError as exc:
            logger.warning(
                "Overpass landmark lookup failed status=%s via=%s lat=%s lon=%s radius_m=%s",
                exc.response.status_code,
                overpass_url,
                lat,
                lon,
                radius_m,
            )
            continue
        except httpx.HTTPError:
            logger.exception(
                "Overpass landmark lookup HTTP error via=%s lat=%s lon=%s radius_m=%s",
                overpass_url,
                lat,
                lon,
                radius_m,
            )
            continue
        except ValueError:
            logger.exception(
                "Overpass landmark lookup returned invalid JSON via=%s lat=%s lon=%s radius_m=%s",
                overpass_url,
                lat,
                lon,
                radius_m,
            )
            continue
        except Exception:
            logger.exception(
                "Unexpected Overpass landmark lookup failure via=%s lat=%s lon=%s radius_m=%s",
                overpass_url,
                lat,
                lon,
                radius_m,
            )
            continue

        if not isinstance(payload, dict):
            logger.warning(
                "Overpass landmark lookup returned unexpected payload via=%s lat=%s lon=%s radius_m=%s",
                overpass_url,
                lat,
                lon,
                radius_m,
            )
            continue

        elements = payload.get("elements", [])
        if isinstance(elements, list):
            return elements

        logger.warning(
            "Overpass landmark lookup returned non-list elements via=%s lat=%s lon=%s radius_m=%s",
            overpass_url,
            lat,
            lon,
            radius_m,
        )

    return []


def _search_strategies(radius_m: int) -> list[dict[str, Any]]:
    tight_radius = min(radius_m, 400)
    medium_radius = min(radius_m, 700)
    radii = list(dict.fromkeys([tight_radius, medium_radius, radius_m]))

    strategies = [
        {"radius_m": radius, "include_soft_categories": False}
        for radius in radii
    ]
    strategies.append({"radius_m": radius_m, "include_soft_categories": True})
    return strategies


def _overpass_urls() -> list[str]:
    urls = [settings.overpass_api_url]
    if settings.overpass_api_url == _DEFAULT_OVERPASS_URL:
        urls.extend(_FALLBACK_OVERPASS_URLS)
    return list(dict.fromkeys(urls))


def _build_candidates(elements: list[dict[str, Any]], origin_lat: float, origin_lon: float) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []

    for element in elements:
        lat, lon = _extract_coordinates(element)
        if lat is None or lon is None:
            continue

        tags = element.get("tags", {})
        if not isinstance(tags, dict):
            continue

        name = _pick_name(tags)
        tourism_value = _string_tag(tags.get("tourism"))
        historic_value = _string_tag(tags.get("historic"))
        if tourism_value == "information" and not historic_value and not tags.get("wikidata"):
            continue

        distance_m = haversine_distance_m(origin_lat, origin_lon, lat, lon)
        has_name = bool(name)
        tourism = tourism_value is not None
        historic = historic_value is not None
        place_of_worship = tags.get("amenity") == "place_of_worship"
        park = tags.get("leisure") == "park"
        water = tags.get("natural") == "water" or tags.get("waterway") == "river"
        wikidata_id = _clean_wikidata_id(tags.get("wikidata"))
        fallback_name = _fallback_name(tags)

        candidates.append(
            {
                "name": name or fallback_name,
                "distance_m": round(distance_m, 1),
                "image_url": None,
                "source": "openstreetmap",
                "osm_type": element.get("type"),
                "osm_id": element.get("id"),
                "wikidata_id": wikidata_id,
                "has_name": has_name,
                "tourism": tourism,
                "tourism_value": tourism_value,
                "historic": historic,
                "historic_value": historic_value,
                "place_of_worship": place_of_worship,
                "park": park,
                "water": water,
            }
        )

    return candidates


def _extract_coordinates(element: dict[str, Any]) -> tuple[float | None, float | None]:
    if "lat" in element and "lon" in element:
        return _to_float(element.get("lat")), _to_float(element.get("lon"))

    center = element.get("center")
    if isinstance(center, dict):
        return _to_float(center.get("lat")), _to_float(center.get("lon"))

    return None, None


def _to_float(value: Any) -> float | None:
    if isinstance(value, (int, float)):
        return float(value)
    return None


def _pick_name(tags: dict[str, Any]) -> str | None:
    for key in ("name", "name:en"):
        value = tags.get(key)
        if isinstance(value, str):
            cleaned = value.strip()
            if cleaned and cleaned.lower() != "yes" and _is_meaningful_name(cleaned):
                return cleaned
    return None


def _string_tag(value: Any) -> str | None:
    if isinstance(value, str):
        cleaned = value.strip()
        if cleaned:
            return cleaned
    return None


def _is_meaningful_name(name: str) -> bool:
    lowered = name.strip().lower()
    if lowered in {"entry", "exit", "parking", "toilet", "ticket counter"}:
        return False
    if re.fullmatch(r"(entry|exit|gate)(\s*(no\.?|number)?\s*\d+)?", lowered):
        return False
    return True


def _clean_wikidata_id(value: Any) -> str | None:
    if not isinstance(value, str):
        return None

    cleaned = value.strip()
    if cleaned.startswith("Q") and cleaned[1:].isdigit():
        return cleaned
    return None


def _fallback_name(tags: dict[str, Any]) -> str:
    if "historic" in tags:
        return "Nearby historic site"
    if "tourism" in tags:
        return "Nearby attraction"
    if tags.get("amenity") == "place_of_worship":
        return "Nearby place of worship"
    if tags.get("leisure") == "park":
        return "Nearby park"
    if tags.get("natural") == "water" or tags.get("waterway") == "river":
        return "Nearby water feature"
    return "Nearby landmark"


def _rank_candidates(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    for candidate in candidates:
        score = 0.0

        if candidate["has_name"]:
            score += 50
        if candidate["wikidata_id"]:
            score += 30
        if candidate["tourism"]:
            score += 25
        if candidate["tourism_value"] in {"attraction", "museum", "artwork"}:
            score += 15
        if candidate["historic"]:
            score += 30
        if candidate["historic_value"] in {"monument", "memorial", "archaeological_site", "castle", "fort", "ruins"}:
            score += 20
        if candidate["place_of_worship"]:
            score += 15
        if candidate["park"]:
            score += 10
        if candidate["water"]:
            score += 8
        if candidate["image_url"]:
            score += 12
        if candidate["tourism_value"] == "information":
            score -= 25

        score += max(0.0, 30 - (candidate["distance_m"] / 100))
        candidate["score"] = score

    return sorted(
        candidates,
        key=lambda candidate: (
            candidate["score"],
            candidate["has_name"],
            -candidate["distance_m"],
        ),
        reverse=True,
    )


def _enrich_top_candidates_with_images(candidates: list[dict[str, Any]]) -> None:
    wikidata_ids = [
        candidate["wikidata_id"]
        for candidate in candidates[:5]
        if candidate["wikidata_id"]
    ]
    if not wikidata_ids:
        return

    image_map = _fetch_wikidata_images(wikidata_ids)
    for candidate in candidates[:5]:
        wikidata_id = candidate["wikidata_id"]
        if not wikidata_id:
            continue

        candidate["image_url"] = image_map.get(wikidata_id)
        if not candidate["image_url"]:
            logger.info("Wikidata image missing for %s", wikidata_id)


def _select_best_candidate(candidates: list[dict[str, Any]]) -> dict[str, Any]:
    best_candidate = candidates[0]
    named_candidates = [candidate for candidate in candidates if candidate["has_name"]]
    if not best_candidate["has_name"] and named_candidates:
        return named_candidates[0]

    nearby_named_candidates = [
        candidate
        for candidate in named_candidates
        if candidate["distance_m"] <= 100
    ]
    if nearby_named_candidates and best_candidate["distance_m"] > 250:
        top_score = best_candidate["score"]
        competitive_nearby_candidates = [
            candidate
            for candidate in nearby_named_candidates
            if candidate["score"] >= top_score - 25
        ]
        if competitive_nearby_candidates:
            return sorted(
                competitive_nearby_candidates,
                key=lambda candidate: (candidate["score"], -candidate["distance_m"]),
                reverse=True,
            )[0]

        return min(nearby_named_candidates, key=lambda candidate: candidate["distance_m"])

    return best_candidate


def _fetch_wikidata_images(wikidata_ids: list[str]) -> dict[str, str | None]:
    unique_ids = list(dict.fromkeys(wikidata_ids))
    joined_ids = ",".join(unique_ids)
    params = {
        "action": "wbgetentities",
        "ids": "|".join(unique_ids),
        "props": "claims",
        "format": "json",
    }
    timeout = _landmark_lookup_timeout()

    try:
        with httpx.Client(timeout=timeout, headers=_REQUEST_HEADERS) as client:
            response = client.get(settings.wikidata_api_url, params=params)
            response.raise_for_status()
            payload = response.json()
    except httpx.TimeoutException:
        logger.warning("Wikidata image lookup timed out ids=%s", joined_ids)
        return {wikidata_id: None for wikidata_id in unique_ids}
    except httpx.HTTPStatusError as exc:
        logger.warning(
            "Wikidata image lookup failed status=%s ids=%s",
            exc.response.status_code,
            joined_ids,
        )
        return {wikidata_id: None for wikidata_id in unique_ids}
    except httpx.HTTPError:
        logger.exception("Wikidata image lookup HTTP error ids=%s", joined_ids)
        return {wikidata_id: None for wikidata_id in unique_ids}
    except ValueError:
        logger.exception("Wikidata image lookup returned invalid JSON ids=%s", joined_ids)
        return {wikidata_id: None for wikidata_id in unique_ids}
    except Exception:
        logger.exception("Unexpected Wikidata image lookup failure ids=%s", joined_ids)
        return {wikidata_id: None for wikidata_id in unique_ids}

    if not isinstance(payload, dict):
        logger.warning("Wikidata image lookup returned unexpected payload ids=%s", joined_ids)
        return {wikidata_id: None for wikidata_id in unique_ids}

    entities = payload.get("entities", {})
    if not isinstance(entities, dict):
        logger.warning("Wikidata image lookup returned non-dict entities ids=%s", joined_ids)
        return {wikidata_id: None for wikidata_id in unique_ids}

    image_map: dict[str, str | None] = {}

    for wikidata_id in unique_ids:
        entity = entities.get(wikidata_id, {})
        claims = entity.get("claims", {})
        image_map[wikidata_id] = _extract_wikimedia_image_url(claims)

    return image_map


def _extract_wikimedia_image_url(claims: dict[str, Any]) -> str | None:
    image_claims = claims.get("P18")
    if not isinstance(image_claims, list) or not image_claims:
        return None

    first_claim = image_claims[0]
    mainsnak = first_claim.get("mainsnak", {})
    datavalue = mainsnak.get("datavalue", {})
    filename = datavalue.get("value")
    if not isinstance(filename, str) or not filename.strip():
        return None

    encoded_filename = quote(filename.strip(), safe="")
    return normalize_image_url(
        f"https://commons.wikimedia.org/wiki/Special:FilePath/{encoded_filename}?width=600"
    )


def normalize_image_url(url: str | None) -> str | None:
    if not url:
        return None

    cleaned = url.strip()
    if not cleaned.startswith(("https://", "http://")):
        return None

    return cleaned


def _to_landmark_response(candidate: dict[str, Any]) -> dict[str, Any]:
    image_url = normalize_image_url(candidate.get("image_url"))
    landmark = {
        "name": candidate["name"],
        "distance_m": candidate["distance_m"],
        "image_url": image_url,
        "source": candidate["source"],
        "osm_type": candidate["osm_type"],
        "osm_id": candidate["osm_id"],
        "wikidata_id": candidate["wikidata_id"],
        "is_real": True,
        "historic": candidate["historic"],
        "tourism": candidate["tourism"],
    }

    if image_url:
        landmark["source"] = "openstreetmap,wikidata"

    return landmark


def _fallback_landmark() -> dict[str, Any]:
    return {
        "name": "No major landmark found nearby",
        "distance_m": None,
        "image_url": None,
        "source": None,
        "osm_type": None,
        "osm_id": None,
        "wikidata_id": None,
        "is_real": False,
        "historic": False,
        "tourism": False,
    }
