"""
Recommendation engine.

Loads disease descriptions and precautions from the CSV files and
provides lookup functions for use in the prediction API response.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, List, Optional

import pandas as pd

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"


class Recommender:
    """Provides descriptions and precautions for diseases."""

    def __init__(self) -> None:
        self._descriptions: Dict[str, str] = {}
        self._precautions: Dict[str, List[str]] = {}
        self._loaded = False

    def load(
        self,
        desc_path: Optional[Path] = None,
        prec_path: Optional[Path] = None,
    ) -> None:
        desc_path = desc_path or DATA_DIR / "symptom_Description.csv"
        prec_path = prec_path or DATA_DIR / "symptom_precaution.csv"

        try:
            desc_df = pd.read_csv(desc_path)
            for _, row in desc_df.iterrows():
                disease = row["Disease"].strip()
                description = str(row["Description"]).strip() if pd.notna(row["Description"]) else ""
                self._descriptions[disease] = description
            logger.info("Loaded %d disease descriptions", len(self._descriptions))
        except Exception as exc:
            logger.warning("Could not load descriptions from %s: %s", desc_path, exc)

        try:
            prec_df = pd.read_csv(prec_path)
            prec_cols = [c for c in prec_df.columns if c.startswith("Precaution")]
            for _, row in prec_df.iterrows():
                disease = row["Disease"].strip()
                precs = [
                    str(row[c]).strip()
                    for c in prec_cols
                    if pd.notna(row[c]) and str(row[c]).strip() and str(row[c]).strip().lower() != "nan"
                ]
                self._precautions[disease] = precs
            logger.info("Loaded %d disease precautions", len(self._precautions))
        except Exception as exc:
            logger.warning("Could not load precautions from %s: %s", prec_path, exc)

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
