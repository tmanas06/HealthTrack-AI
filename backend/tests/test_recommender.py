"""
Tests for the recommendation engine.
"""
import pytest
import sys
import os
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from api.recommender import Recommender

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"


@pytest.fixture
def recommender():
    r = Recommender()
    r.load(
        desc_path=DATA_DIR / "symptom_Description.csv",
        prec_path=DATA_DIR / "symptom_precaution.csv",
    )
    return r


class TestRecommender:
    def test_is_loaded(self, recommender):
        assert recommender.is_loaded

    def test_known_disease_description(self, recommender):
        desc = recommender.get_description("Malaria")
        assert desc is not None
        assert len(desc) > 10

    def test_unknown_disease_description_returns_none(self, recommender):
        desc = recommender.get_description("XYZ_Fake_Disease_99")
        assert desc is None

    def test_known_disease_precautions(self, recommender):
        precs = recommender.get_precautions("Malaria")
        assert isinstance(precs, list)
        assert len(precs) > 0

    def test_unknown_disease_precautions_empty_list(self, recommender):
        precs = recommender.get_precautions("XYZ_Fake_Disease_99")
        assert precs == []

    def test_missing_description_graceful(self, recommender):
        # "Dimorphic hemmorhoids(piles)" has no description in the CSV
        desc = recommender.get_description("Dimorphic hemmorhoids(piles)")
        # Should return None or empty string, not raise
        assert desc is None or isinstance(desc, str)
