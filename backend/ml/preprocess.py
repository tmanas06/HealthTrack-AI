"""
Symptom preprocessing pipeline.

Responsibilities:
- Normalize symptom names (strip, lowercase, collapse spaces/underscores).
- Maintain the canonical symptom vocabulary derived from the training data.
- Build multi-hot feature vectors from a list of symptom strings.
- Validate inputs: empty, unknown, duplicate, and malformed.
"""

from __future__ import annotations

import re
import json
import logging
from pathlib import Path
from typing import List, Tuple, Dict

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Known normalization aliases discovered during data inspection.
# Raw CSV values on the left -> canonical name on the right.
# ---------------------------------------------------------------------------
_RAW_ALIASES: Dict[str, str] = {
    "dischromic _patches": "dischromic_patches",
    "foul_smell_of urine": "foul_smell_of_urine",
    "spotting_ urination": "spotting_urination",
}


def normalize_symptom(raw: str) -> str:
    """Return a canonicalized symptom token."""
    s = raw.strip()
    for alias, canonical in _RAW_ALIASES.items():
        if s.lower() == alias.lower():
            s = canonical
            break
    s = s.lower()
    s = re.sub(r"[\s\-]+", "_", s)
    s = re.sub(r"_+", "_", s)
    return s


class SymptomVocabulary:
    """Fixed ordered vocabulary of symptoms used as the feature space."""

    def __init__(self, symptoms: List[str]) -> None:
        self._vocab: List[str] = sorted(set(symptoms))
        self._index: Dict[str, int] = {s: i for i, s in enumerate(self._vocab)}

    @property
    def size(self) -> int:
        return len(self._vocab)

    @property
    def symptoms(self) -> List[str]:
        return list(self._vocab)

    def __contains__(self, symptom: str) -> bool:
        return symptom in self._index

    def encode(self, symptoms: List[str]) -> np.ndarray:
        """Return a multi-hot binary vector of shape (vocab_size,)."""
        vec = np.zeros(self.size, dtype=np.float32)
        for s in symptoms:
            if s in self._index:
                vec[self._index[s]] = 1.0
        return vec

    def to_dict(self) -> dict:
        return {"symptoms": self._vocab}

    @classmethod
    def from_dict(cls, d: dict) -> "SymptomVocabulary":
        return cls(d["symptoms"])

    def save(self, path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(self.to_dict(), f, indent=2)
        logger.info("Vocabulary (%d symptoms) saved to %s", self.size, path)

    @classmethod
    def load(cls, path) -> "SymptomVocabulary":
        with open(path) as f:
            d = json.load(f)
        return cls.from_dict(d)


def load_dataset(dataset_path) -> Tuple[pd.DataFrame, SymptomVocabulary]:
    """Load dataset.csv, normalize symptoms, and return DataFrame + vocab."""
    path = Path(dataset_path)
    df_raw = pd.read_csv(path)
    symptom_cols = [c for c in df_raw.columns if c.startswith("Symptom")]

    records = []
    for _, row in df_raw.iterrows():
        disease = row["Disease"].strip()
        syms: List[str] = []
        for col in symptom_cols:
            val = row[col]
            if pd.notna(val) and str(val).strip():
                syms.append(normalize_symptom(str(val)))
        records.append({"disease": disease, "symptoms": frozenset(syms)})

    df = pd.DataFrame(records)

    all_syms: List[str] = []
    for sym_set in df["symptoms"]:
        all_syms.extend(sym_set)
    vocab = SymptomVocabulary(all_syms)

    logger.info(
        "Loaded %d records, %d unique diseases, %d unique symptoms",
        len(df),
        df["disease"].nunique(),
        vocab.size,
    )
    return df, vocab


def build_feature_matrix(
    df: pd.DataFrame, vocab: SymptomVocabulary
) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """Build X (multi-hot) and y (labels) from a processed DataFrame."""
    X = np.vstack([vocab.encode(list(row["symptoms"])) for _, row in df.iterrows()])
    y = df["disease"].values
    class_names = sorted(df["disease"].unique().tolist())
    return X, y, class_names


class ValidationError(ValueError):
    """Raised when the symptom input cannot be processed."""


def validate_and_normalize_symptoms(
    raw_symptoms: List[str],
    vocab: SymptomVocabulary,
) -> Tuple[List[str], List[str]]:
    """Validate and normalize a list of raw symptom strings from the user.

    Returns:
        known:    Deduplicated list of normalized symptoms present in vocab.
        unknown:  Symptoms not found in the vocabulary (after normalization).

    Raises:
        ValidationError: If input is empty or all symptoms are empty strings.
    """
    if not raw_symptoms:
        raise ValidationError("No symptoms provided.")

    seen: set = set()
    known: List[str] = []
    unknown: List[str] = []

    for raw in raw_symptoms:
        if not isinstance(raw, str) or not raw.strip():
            logger.warning("Skipping empty or non-string symptom: %r", raw)
            continue
        norm = normalize_symptom(raw)
        if norm in seen:
            logger.debug("Duplicate symptom skipped: %r", norm)
            continue
        seen.add(norm)
        if norm in vocab:
            known.append(norm)
        else:
            unknown.append(norm)

    if not known and not unknown:
        raise ValidationError("All provided symptoms were empty or whitespace.")

    return known, unknown


def build_inference_vector(
    known_symptoms: List[str], vocab: SymptomVocabulary
) -> np.ndarray:
    """Build a 2-D feature matrix suitable for sklearn predict / predict_proba."""
    return vocab.encode(known_symptoms).reshape(1, -1)
