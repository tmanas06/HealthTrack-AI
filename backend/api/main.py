"""
FastAPI application entry point.

Run with:
    uvicorn api.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
import os
import sys
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("healthtrack")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ----- startup -----
    logger.info("HealthTrack AI backend starting up...")
    try:
        from api.model_loader import get_model
        model = get_model()
        logger.info(
            "Model ready: version=%s, features=%d",
            model.model_version,
            model.vocab.size if model.vocab else 0,
        )
    except RuntimeError as exc:
        logger.error(
            "Startup warning: %s. "
            "Run 'python -m ml.train' to generate the model before serving.",
            exc,
        )
    try:
        from api.recommender import get_recommender
        get_recommender()
        logger.info("Recommender loaded.")
    except Exception as exc:
        logger.warning("Recommender load warning: %s", exc)

    yield  # application runs

    # ----- shutdown -----
    logger.info("HealthTrack AI backend shutting down.")


app = FastAPI(
    title="HealthTrack AI",
    description=(
        "Educational symptom assessment API. "
        "NOT a substitute for professional medical advice."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS - Allow all local origins (localhost and 127.0.0.1 on any port)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next) -> Response:
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s -> %d (%.1f ms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


from api.routes import router
app.include_router(router, prefix="/api")
