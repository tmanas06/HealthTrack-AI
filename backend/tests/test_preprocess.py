"""
Tests for ml.preprocess module.
"""

import numpy as np
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from ml.preprocess import (
    ValidationError,
    SymptomVocabulary,
    build_inference_vector,
    normalize_symptom,
    validate_and_normalize_symptoms,
)


def make_vocab():
    return SymptomVocabulary(["itching", "skin_rash", "nausea", "vomiting", "fever"])


class TestNormalizeSymptom:
    def test_strips_whitespace(self):
        assert normalize_symptom("  itching  ") == "itching"

    def test_lowercases(self):
        assert normalize_symptom("ITCHING") == "itching"

    def test_replaces_spaces_with_underscores(self):
        assert normalize_symptom("skin rash") == "skin_rash"

    def test_collapses_multiple_underscores(self):
        assert normalize_symptom("skin__rash") == "skin_rash"

    def test_alias_dischromic_patches(self):
        assert normalize_symptom("dischromic _patches") == "dischromic_patches"

    def test_alias_foul_smell(self):
        assert normalize_symptom("foul_smell_of urine") == "foul_smell_of_urine"

    def test_alias_spotting_urination(self):
        assert normalize_symptom("spotting_ urination") == "spotting_urination"

    def test_hyphen_replaced(self):
        assert normalize_symptom("skin-rash") == "skin_rash"


class TestSymptomVocabulary:
    def test_size(self):
        vocab = make_vocab()
        assert vocab.size == 5

    def test_contains_known(self):
        vocab = make_vocab()
        assert "itching" in vocab

    def test_not_contains_unknown(self):
        vocab = make_vocab()
        assert "cough" not in vocab

    def test_encode_known(self):
        vocab = make_vocab()
        vec = vocab.encode(["itching"])
        assert vec.sum() == 1.0

    def test_encode_empty(self):
        vocab = make_vocab()
        vec = vocab.encode([])
        assert vec.sum() == 0.0

    def test_encode_unknown_ignored(self):
        vocab = make_vocab()
        vec = vocab.encode(["unknown_symptom"])
        assert vec.sum() == 0.0

    def test_encode_multiple(self):
        vocab = make_vocab()
        vec = vocab.encode(["itching", "nausea"])
        assert vec.sum() == 2.0

    def test_sorted_order(self):
        vocab = SymptomVocabulary(["z", "a", "m"])
        assert vocab.symptoms == ["a", "m", "z"]

    def test_save_load(self, tmp_path):
        vocab = make_vocab()
        path = tmp_path / "vocab.json"
        vocab.save(path)
        loaded = SymptomVocabulary.load(path)
        assert loaded.symptoms == vocab.symptoms
        assert loaded.size == vocab.size


class TestValidateAndNormalizeSymptoms:
    def test_empty_list_raises(self):
        vocab = make_vocab()
        with pytest.raises(ValidationError):
            validate_and_normalize_symptoms([], vocab)

    def test_all_empty_strings_raises(self):
        vocab = make_vocab()
        with pytest.raises(ValidationError):
            validate_and_normalize_symptoms(["", "  ", "\t"], vocab)

    def test_known_symptoms_returned(self):
        vocab = make_vocab()
        known, unknown = validate_and_normalize_symptoms(["itching", "nausea"], vocab)
        assert set(known) == {"itching", "nausea"}
        assert unknown == []

    def test_unknown_symptoms_captured(self):
        vocab = make_vocab()
        known, unknown = validate_and_normalize_symptoms(["chest_pain"], vocab)
        assert known == []
        assert "chest_pain" in unknown

    def test_duplicates_deduplicated(self):
        vocab = make_vocab()
        known, unknown = validate_and_normalize_symptoms(["itching", "itching", "itching"], vocab)
        assert known.count("itching") == 1

    def test_mixed_known_and_unknown(self):
        vocab = make_vocab()
        known, unknown = validate_and_normalize_symptoms(["itching", "xyz_unknown"], vocab)
        assert "itching" in known
        assert "xyz_unknown" in unknown

    def test_whitespace_items_skipped(self):
        vocab = make_vocab()
        known, unknown = validate_and_normalize_symptoms(["itching", "   ", ""], vocab)
        assert "itching" in known

    def test_normalization_applied(self):
        vocab = make_vocab()
        known, unknown = validate_and_normalize_symptoms(["  ITCHING  "], vocab)
        assert "itching" in known


class TestBuildInferenceVector:
    def test_returns_2d_array(self):
        vocab = make_vocab()
        vec = build_inference_vector(["itching"], vocab)
        assert vec.ndim == 2
        assert vec.shape == (1, vocab.size)

    def test_feature_consistency(self):
        vocab = make_vocab()
        v1 = build_inference_vector(["itching", "nausea"], vocab)
        v2 = build_inference_vector(["nausea", "itching"], vocab)
        np.testing.assert_array_equal(v1, v2)
