"""
Integration tests for the FastAPI endpoints.

Uses TestClient from httpx + pytest-asyncio.
These tests require the trained model artifacts to be present.
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient

from api.main import app
from api.cache import get_cache


@pytest.fixture(autouse=True)
def clear_cache():
    """Clear cache before each test."""
    get_cache().clear()
    yield
    get_cache().clear()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200

    def test_health_model_loaded(self, client):
        resp = client.get("/api/health")
        data = resp.json()
        assert data["model_loaded"] is True
        assert data["vocabulary_size"] > 0

    def test_health_status_ok(self, client):
        resp = client.get("/api/health")
        assert resp.json()["status"] == "ok"


class TestSymptomsEndpoint:
    def test_symptoms_returns_list(self, client):
        resp = client.get("/api/symptoms")
        assert resp.status_code == 200
        data = resp.json()
        assert "symptoms" in data
        assert len(data["symptoms"]) > 0

    def test_symptoms_contains_itching(self, client):
        resp = client.get("/api/symptoms")
        assert "itching" in resp.json()["symptoms"]


class TestPredictEndpoint:
    def test_valid_prediction_returns_200(self, client):
        resp = client.post("/api/predict", json={"symptoms": ["itching", "skin_rash"]})
        assert resp.status_code == 200

    def test_prediction_response_structure(self, client):
        resp = client.post("/api/predict", json={"symptoms": ["itching", "skin_rash"]})
        data = resp.json()
        assert "candidates" in data
        assert "known_symptoms" in data
        assert "unknown_symptoms" in data
        assert "model_version" in data
        assert "disclaimer" in data

    def test_candidates_ranked(self, client):
        resp = client.post("/api/predict", json={"symptoms": ["itching", "skin_rash"]})
        candidates = resp.json()["candidates"]
        assert len(candidates) > 0
        ranks = [c["rank"] for c in candidates]
        assert ranks == sorted(ranks)

    def test_scores_sum_to_at_most_one(self, client):
        resp = client.post("/api/predict", json={"symptoms": ["itching", "skin_rash"]})
        scores = [c["score"] for c in resp.json()["candidates"]]
        assert sum(scores) <= 1.0 + 1e-6

    def test_unknown_symptoms_captured(self, client):
        resp = client.post("/api/predict", json={"symptoms": ["itching", "completely_unknown_symptom_xyz"]})
        assert resp.status_code == 200
        data = resp.json()
        assert "completely_unknown_symptom_xyz" in data["unknown_symptoms"]

    def test_empty_symptoms_list_returns_422(self, client):
        resp = client.post("/api/predict", json={"symptoms": []})
        assert resp.status_code == 422

    def test_all_unknown_symptoms_returns_422(self, client):
        resp = client.post("/api/predict", json={"symptoms": ["xyz_totally_fake", "abc_not_real"]})
        assert resp.status_code == 422

    def test_all_empty_strings_returns_422(self, client):
        resp = client.post("/api/predict", json={"symptoms": ["", "  "]})
        assert resp.status_code == 422

    def test_duplicate_symptoms_deduplicated(self, client):
        resp = client.post("/api/predict", json={"symptoms": ["itching", "itching", "itching"]})
        assert resp.status_code == 200
        known = resp.json()["known_symptoms"]
        assert known.count("itching") == 1

    def test_disclaimer_present(self, client):
        resp = client.post("/api/predict", json={"symptoms": ["itching"]})
        data = resp.json()
        assert "disclaimer" in data
        assert len(data["disclaimer"]) > 50

    def test_missing_symptoms_field_returns_422(self, client):
        resp = client.post("/api/predict", json={})
        assert resp.status_code == 422

    def test_score_label_present(self, client):
        resp = client.post("/api/predict", json={"symptoms": ["fatigue", "weight_loss"]})
        data = resp.json()
        for cand in data["candidates"]:
            assert cand["score_label"] == "model_vote_fraction"

    def test_candidate_specific_matching_symptoms(self, client):
        resp = client.post(
            "/api/predict",
            json={"symptoms": ["itching", "skin_rash", "nodal_skin_eruptions"]},
        )
        assert resp.status_code == 200
        candidates = resp.json()["candidates"]
        assert len(candidates) >= 2
        cand_map = {c["condition"]: c for c in candidates}
        if "Fungal infection" in cand_map:
            assert "nodal_skin_eruptions" in cand_map["Fungal infection"]["matching_symptoms"]
        if "Drug Reaction" in cand_map:
            assert "nodal_skin_eruptions" not in cand_map["Drug Reaction"]["matching_symptoms"]



class TestCacheBehavior:
    def test_second_request_uses_cache(self, client):
        payload = {"symptoms": ["itching", "skin_rash"]}
        resp1 = client.post("/api/predict", json=payload)
        resp2 = client.post("/api/predict", json=payload)
        assert resp1.status_code == 200
        assert resp2.status_code == 200
        # Both should return identical results
        assert resp1.json()["candidates"] == resp2.json()["candidates"]

    def test_cache_key_insensitive_to_order(self, client):
        resp1 = client.post("/api/predict", json={"symptoms": ["itching", "skin_rash"]})
        resp2 = client.post("/api/predict", json={"symptoms": ["skin_rash", "itching"]})
        # Cache keys are sorted, so results should be the same
        assert resp1.json()["candidates"] == resp2.json()["candidates"]

    def test_cache_stats(self, client):
        cache = get_cache()
        cache.clear()
        client.post("/api/predict", json={"symptoms": ["itching"]})
        stats = cache.stats
        assert stats["misses"] >= 1
        client.post("/api/predict", json={"symptoms": ["itching"]})
        stats2 = cache.stats
        assert stats2["hits"] >= 1
