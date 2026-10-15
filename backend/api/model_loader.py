"""
Loads and holds the trained model artifacts.

Uses a module-level singleton so the model is loaded once at startup.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import joblib
import numpy as np

from ml.preprocess import SymptomVocabulary

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent
MODEL_PATH = BASE_DIR / "ml" / "models" / "rf_model.joblib"
VOCAB_PATH = BASE_DIR / "ml" / "models" / "vocab.json"


class ModelBundle:
    """Holds the trained model, label encoder, vocabulary, and metadata."""

    def __init__(self) -> None:
        self.model = None
        self.label_encoder = None
        self.class_names: list[str] = []
        self.vocab: Optional[SymptomVocabulary] = None
        self.model_version: str = "unknown"
        self._loaded: bool = False

    def load(
        self,
        model_path: Optional[Path] = None,
        vocab_path: Optional[Path] = None,
    ) -> None:
        model_path = model_path or MODEL_PATH
        vocab_path = vocab_path or VOCAB_PATH

        try:
            bundle = joblib.load(model_path)
            self.model = bundle["model"]
            self.label_encoder = bundle["label_encoder"]
            self.class_names = bundle["class_names"]
            self.model_version = bundle.get("model_version", "unknown")
            logger.info("Model loaded: version=%s", self.model_version)
        except FileNotFoundError:
            raise RuntimeError(
                f"Model file not found at {model_path}. "
                "Run 'python -m ml.train' from the backend directory first."
            )
        except Exception as exc:
            raise RuntimeError(f"Failed to load model: {exc}") from exc

        try:
            self.vocab = SymptomVocabulary.load(vocab_path)
            logger.info("Vocabulary loaded: %d symptoms", self.vocab.size)
        except FileNotFoundError:
            raise RuntimeError(f"Vocabulary file not found at {vocab_path}.")
        except Exception as exc:
            raise RuntimeError(f"Failed to load vocabulary: {exc}") from exc

        self._loaded = True

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def predict_ranked(self, feature_vector: np.ndarray, top_k: int = 5) -> list[dict]:
        """Return top-k ranked predictions with model vote fractions.

        Args:
            feature_vector: Shape (1, n_features).
            top_k: Number of candidates to return.

        Returns:
            List of dicts: [{'condition': str, 'score': float}, ...]
        """
        if not self._loaded:
            raise RuntimeError("Model not loaded.")

        proba = self.model.predict_proba(feature_vector)[0]
        top_indices = np.argsort(proba)[-top_k:][::-1]

        results = []
        for rank, idx in enumerate(top_indices, start=1):
            label_enc = idx  # predict_proba order matches label_encoder classes_
            condition = self.label_encoder.classes_[label_enc]
            score = float(proba[label_enc])
            results.append({"condition": condition, "score": score, "rank": rank})
        return results


# Module-level singleton
_bundle: Optional[ModelBundle] = None


def get_model() -> ModelBundle:
    global _bundle
    if _bundle is None:
        _bundle = ModelBundle()
        _bundle.load()
    return _bundle


def reset_model() -> None:
    """Reset singleton (used in tests)."""
    global _bundle
    _bundle = None
