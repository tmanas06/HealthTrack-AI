"""
FastAPI route handlers.

POST /api/predict  - Symptom assessment endpoint.
GET  /api/health   - Health check.
GET  /api/symptoms - Return all known symptoms for the frontend selector.
"""

from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, HTTPException, status

from api.cache import get_cache
from api.model_loader import get_model
from api.recommender import get_recommender
from api.schemas import (
    CandidateCondition,
    ErrorResponse,
    HealthResponse,
    PredictRequest,
    PredictResponse,
)
from ml.preprocess import (
    ValidationError,
    build_inference_vector,
    validate_and_normalize_symptoms,
)

logger = logging.getLogger(__name__)
router = APIRouter()

# ---------------------------------------------------------------------------
# Urgent symptom safety check
# ---------------------------------------------------------------------------
URGENT_SYMPTOMS = {
    "chest_pain",
    "slurred_speech",
    "weakness_of_one_body_side",
    "loss_of_balance",
    "coma",
    "blood_in_sputum",
    "stomach_bleeding",
}

URGENT_MESSAGE = (
    "One or more symptoms you selected may indicate a serious medical emergency. "
    "Please call emergency services or go to the nearest emergency department immediately. "
    "Do not rely on this tool in an emergency situation."
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Service health check."""
    try:
        model = get_model()
        return HealthResponse(
            status="ok",
            model_loaded=model.is_loaded,
            model_version=model.model_version,
            vocabulary_size=model.vocab.size if model.vocab else 0,
        )
    except RuntimeError as exc:
        return HealthResponse(
            status="degraded",
            model_loaded=False,
            model_version=None,
            vocabulary_size=0,
        )


@router.get("/symptoms", tags=["Symptoms"])
async def get_symptoms() -> dict:
    """Return the full list of known symptoms (for the frontend selector)."""
    try:
        model = get_model()
        return {"symptoms": model.vocab.symptoms if model.vocab else []}
    except RuntimeError:
        return {"symptoms": []}


@router.post(
    "/predict",
    response_model=PredictResponse,
    tags=["Prediction"],
    responses={
        422: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
async def predict(request: PredictRequest) -> PredictResponse:
    """
    Assess a list of symptoms and return ranked candidate conditions.

    - Symptoms are normalized and validated against the training vocabulary.
    - Results are ranked by Random Forest vote fraction (not calibrated probabilities).
    - A medical disclaimer is always included in the response.
    """
    # ------------------------------------------------------------------ #
    # Load model
    # ------------------------------------------------------------------ #
    try:
        model = get_model()
    except RuntimeError as exc:
        logger.error("Model unavailable: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )

    # ------------------------------------------------------------------ #
    # Validate and normalize symptoms
    # ------------------------------------------------------------------ #
    try:
        known, unknown = validate_and_normalize_symptoms(request.symptoms, model.vocab)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        )

    logger.info(
        "Prediction request: known=%d symptoms, unknown=%d symptoms",
        len(known),
        len(unknown),
    )

    if not known:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=(
                "None of the provided symptoms are recognized by the model. "
                f"Unknown symptoms: {unknown}. "
                "Please select symptoms from the supported list."
            ),
        )

    # ------------------------------------------------------------------ #
    # Check cache
    # ------------------------------------------------------------------ #
    cache = get_cache()
    cached = cache.get(known, model.model_version)
    if cached is not None:
        logger.info("Returning cached prediction result.")
        return cached

    # ------------------------------------------------------------------ #
    # Urgent symptom safety check
    # ------------------------------------------------------------------ #
    urgent_found = URGENT_SYMPTOMS.intersection(set(known))

    # ------------------------------------------------------------------ #
    # Build feature vector and predict
    # ------------------------------------------------------------------ #
    X = build_inference_vector(known, model.vocab)
    ranked = model.predict_ranked(X, top_k=5)

    # ------------------------------------------------------------------ #
    # Load recommendations
    # ------------------------------------------------------------------ #
    recommender = get_recommender()

    candidates: List[CandidateCondition] = []
    for item in ranked:
        condition = item["condition"]
        desc = recommender.get_description(condition)
        precs = recommender.get_precautions(condition)
        matching_syms = recommender.get_matching_symptoms(condition, known)

        # Annotate precautions with urgent guidance if applicable
        all_precs = list(precs)
        if urgent_found and item["rank"] == 1:
            all_precs = [URGENT_MESSAGE] + all_precs

        candidates.append(
            CandidateCondition(
                rank=item["rank"],
                condition=condition,
                score=round(item["score"], 4),
                score_label="model_vote_fraction",
                description=desc,
                precautions=all_precs,
                matching_symptoms=matching_syms,
            )
        )

    response = PredictResponse(
        candidates=candidates,
        known_symptoms=known,
        unknown_symptoms=unknown,
        model_version=model.model_version,
    )

    # ------------------------------------------------------------------ #
    # Store in cache
    # ------------------------------------------------------------------ #
    cache.set(known, model.model_version, response)

    return response
