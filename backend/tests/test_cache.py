"""
Tests for the in-memory LRU cache.
"""
import pytest
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from api.cache import PredictionCache


@pytest.fixture
def cache():
    return PredictionCache(maxsize=3)


class TestPredictionCache:
    def test_miss_returns_none(self, cache):
        result = cache.get(["itching"], "v1")
        assert result is None

    def test_set_and_get(self, cache):
        cache.set(["itching"], "v1", {"result": "ok"})
        result = cache.get(["itching"], "v1")
        assert result == {"result": "ok"}

    def test_key_insensitive_to_order(self, cache):
        cache.set(["itching", "rash"], "v1", "data")
        result = cache.get(["rash", "itching"], "v1")
        assert result == "data"

    def test_key_includes_model_version(self, cache):
        cache.set(["itching"], "v1", "data_v1")
        result = cache.get(["itching"], "v2")
        assert result is None

    def test_eviction_on_overflow(self, cache):
        cache.set(["a"], "v1", "val_a")
        cache.set(["b"], "v1", "val_b")
        cache.set(["c"], "v1", "val_c")
        cache.set(["d"], "v1", "val_d")  # evicts "a"
        assert cache.get(["a"], "v1") is None
        assert cache.get(["d"], "v1") == "val_d"

    def test_stats_tracks_hits_misses(self, cache):
        cache.set(["itching"], "v1", "x")
        cache.get(["itching"], "v1")   # hit
        cache.get(["unknown"], "v1")   # miss
        stats = cache.stats
        assert stats["hits"] == 1
        assert stats["misses"] == 1

    def test_clear_resets(self, cache):
        cache.set(["itching"], "v1", "x")
        cache.clear()
        assert cache.get(["itching"], "v1") is None
        assert cache.stats["hits"] == 0

    def test_duplicate_symptoms_normalized(self, cache):
        cache.set(["itching", "itching"], "v1", "data")
        result = cache.get(["itching"], "v1")
        assert result == "data"
