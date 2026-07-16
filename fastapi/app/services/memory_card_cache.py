from __future__ import annotations

import time
from collections import OrderedDict
from threading import Lock

from app.core.config import settings
from app.schemas.place_dna import PlaceDNAResponse

_CacheKey = tuple[float, float, int]
_CacheEntry = tuple[float, PlaceDNAResponse]

_cache: OrderedDict[_CacheKey, _CacheEntry] = OrderedDict()
_cache_lock = Lock()


def _cache_key(lat: float, lon: float, radius_m: int) -> _CacheKey:
    precision = max(0, settings.memory_card_cache_coordinate_precision)
    return (round(lat, precision), round(lon, precision), radius_m)


def get_memory_cached_card(
    *,
    lat: float,
    lon: float,
    radius_m: int,
) -> PlaceDNAResponse | None:
    if not settings.memory_card_cache_enabled:
        return None

    key = _cache_key(lat, lon, radius_m)
    now = time.monotonic()

    with _cache_lock:
        entry = _cache.get(key)
        if entry is None:
            return None

        expires_at, card = entry
        if expires_at <= now:
            del _cache[key]
            return None

        _cache.move_to_end(key)
        return card


def set_memory_cached_card(
    *,
    lat: float,
    lon: float,
    radius_m: int,
    card: PlaceDNAResponse,
) -> None:
    if not settings.memory_card_cache_enabled:
        return

    ttl_seconds = max(1, settings.memory_card_cache_ttl_seconds)
    max_items = max(1, settings.memory_card_cache_max_items)
    key = _cache_key(lat, lon, radius_m)

    with _cache_lock:
        _cache[key] = (time.monotonic() + ttl_seconds, card)
        _cache.move_to_end(key)

        while len(_cache) > max_items:
            _cache.popitem(last=False)


def clear_memory_card_cache() -> None:
    with _cache_lock:
        _cache.clear()
