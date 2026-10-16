"""
Recommendation engine.

Loads disease descriptions, precautions, and disease-to-symptom mappings from
the CSV files and provides lookup functions for use in the prediction API response.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, List, Optional, Set

import pandas as pd

from ml.preprocess import normalize_symptom

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"


class Recommender:
    """Provides descriptions, precautions, and symptom overlap lookups for diseases."""

    def __init__(self) -> None:
        self._descriptions: Dict[str, str] = {}
        self._precautions: Dict[str, List[str]] = {}
        self._disease_symptoms: Dict[str, Set[str]] = {}
        self._loaded = False

    def load(
        self,
        desc_path: Optional[Path] = None,
        prec_path: Optional[Path] = None,
        dataset_path: Optional[Path] = None,
    ) -> None:
        desc_path = desc_path or DATA_DIR / "symptom_Description.csv"
        prec_path = prec_path or DATA_DIR / "symptom_precaution.csv"
        dataset_path = dataset_path or DATA_DIR / "dataset.csv"

        try:
            desc_df = pd.read_csv(desc_path)
            for _, row in desc_df.iterrows():
                disease = str(row["Disease"]).strip()
                description = str(row["Description"]).strip() if pd.notna(row["Description"]) else ""
                self._descriptions[disease] = description
            logger.info("Loaded %d disease descriptions", len(self._descriptions))
        except Exception as exc:
            logger.warning("Could not load descriptions from %s: %s", desc_path, exc)

        try:
            prec_df = pd.read_csv(prec_path)
            prec_cols = [c for c in prec_df.columns if c.startswith("Precaution")]
            for _, row in prec_df.iterrows():
                disease = str(row["Disease"]).strip()
                precs = [
                    str(row[c]).strip()
                    for c in prec_cols
                    if pd.notna(row[c]) and str(row[c]).strip() and str(row[c]).strip().lower() != "nan"
                ]
                self._precautions[disease] = precs
            logger.info("Loaded %d disease precautions", len(self._precautions))
        except Exception as exc:
            logger.warning("Could not load precautions from %s: %s", prec_path, exc)

        try:
            df = pd.read_csv(dataset_path)
            symptom_cols = [c for c in df.columns if c.startswith("Symptom")]
            disease_syms: Dict[str, Set[str]] = {}
            for _, row in df.iterrows():
                disease = str(row["Disease"]).strip()
                if disease not in disease_syms:
                    disease_syms[disease] = set()
                for col in symptom_cols:
                    val = row[col]
                    if pd.notna(val) and str(val).strip():
                        disease_syms[disease].add(normalize_symptom(str(val)))
            self._disease_symptoms = disease_syms
            logger.info("Loaded symptoms for %d diseases", len(self._disease_symptoms))
        except Exception as exc:
            logger.warning("Could not load disease symptoms from %s: %s", dataset_path, exc)
            self._disease_symptoms = {}

        self._loaded = True

    def get_description(self, disease: str) -> Optional[str]:
        """Return the description for a disease, or None if not available."""
        return self._descriptions.get(disease) or self._descriptions.get(disease.strip())

    def get_precautions(self, disease: str) -> List[str]:
        """Return precaution list for a disease, or empty list."""
        return (
            self._precautions.get(disease)
            or self._precautions.get(disease.strip())
            or []
        )

    def get_disease_symptoms(self, disease: str) -> Set[str]:
        """Return the set of known canonical symptoms associated with a disease in the training data."""
        return (
            self._disease_symptoms.get(disease)
            or self._disease_symptoms.get(disease.strip())
            or set()
        )

    def get_matching_symptoms(self, disease: str, input_symptoms: List[str]) -> List[str]:
        """Return the subset of input_symptoms that are associated with the disease.

        Preserves the order of input_symptoms. If the disease has no supporting
        symptom data in the training set, returns an empty list.

        Note: Presence of matching symptoms reflects correlation in the synthetic training
        data and does not confirm a medical diagnosis.
        """
        disease_syms = self.get_disease_symptoms(disease)
        if not disease_syms:
            return []
        return [s for s in input_symptoms if s in disease_syms]

    @property
    def is_loaded(self) -> bool:
        return self._loaded


# Module-level singleton
_recommender: Optional[Recommender] = None


def get_recommender() -> Recommender:
    global _recommender
    if _recommender is None:
        _recommender = Recommender()
        _recommender.load()
    return _recommender
