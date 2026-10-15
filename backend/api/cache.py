"""
Simple thread-safe in-memory LRU cache for prediction results.

Cache key: (sorted_symptom_tuple, model_version)
"""

from __future__ import annotations

import hashlib
import json
import logging
import threading
from collections import OrderedDict
from typing import Any, Optional, Tuple

logger = logging.getLogger(__name__)


class PredictionCache:
    """Thread-safe in-memory LRU cache with configurable capacity."""

    def __init__(self, maxsize: int = 512) -> None:
        self._cache: OrderedDict[str, Any] = OrderedDict()
        self._maxsize = maxsize
        self._lock = threading.Lock()
        self._hits = 0
        self._misses = 0

    def _make_key(self, symptoms: list[str], model_version: str) -> str:
        """Canonical key: SHA-256 of sorted deduplicated symptoms + model version."""
        canonical = sorted(set(s.lower().strip() for s in symptoms if s.strip()))
        payload = json.dumps({"symptoms": canonical, "model_version": model_version}, sort_keys=True)
        return hashlib.sha256(payload.encode()).hexdigest()

    def get(self, symptoms: list[str], model_version: str) -> Optional[Any]:
        key = self._make_key(symptoms, model_version)
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
                self._hits += 1
                logger.debug("Cache hit (key=%s...)", key[:8])
                return self._cache[key]
            self._misses += 1
            return None

    def set(self, symptoms: list[str], model_version: str, value: Any) -> None:
        key = self._make_key(symptoms, model_version)
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = value
            if len(self._cache) > self._maxsize:
                evicted_key, _ = self._cache.popitem(last=False)
                logger.debug("Cache eviction (key=%s...)", evicted_key[:8])

    @property
    def stats(self) -> dict:
        with self._lock:
            return {
                "size": len(self._cache),
                "maxsize": self._maxsize,
                "hits": self._hits,
                "misses": self._misses,
            }

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()
            self._hits = 0
            self._misses = 0


# Module-level singleton
_cache: Optional[PredictionCache] = None


def get_cache() -> PredictionCache:
    global _cache
    if _cache is None:
        _cache = PredictionCache(maxsize=512)
    return _cache
