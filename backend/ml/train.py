"""
Model training pipeline for HealthTrack AI.

Evaluates Random Forest and Logistic Regression baselines on deduplicated
symptom data, logs evaluation metrics (accuracy, macro F1, per-class recall,
top-3 accuracy), and saves the trained model artifact, vocabulary, and metrics.
"""

import json
import logging
from pathlib import Path
from collections import defaultdict, Counter

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.preprocessing import LabelEncoder

from ml.preprocess import build_feature_matrix, load_dataset

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "ml" / "models"

DATASET_PATH = DATA_DIR / "dataset.csv"
MODEL_PATH = MODEL_DIR / "rf_model.joblib"
VOCAB_PATH = MODEL_DIR / "vocab.json"
METRICS_PATH = MODEL_DIR / "metrics.json"

RANDOM_STATE = 42
TEST_SIZE = 0.2
RF_N_ESTIMATORS = 200
RF_MAX_DEPTH = None


def top_k_accuracy(y_true: np.ndarray, proba: np.ndarray, classes: list, k: int = 3) -> float:
    """Compute top-k accuracy: fraction of samples where true label is in top-k predictions."""
    correct = 0
    for true_label, row in zip(y_true, proba):
        top_k_indices = np.argsort(row)[-k:]
        top_k_labels = [classes[i] for i in top_k_indices]
        if true_label in top_k_labels:
            correct += 1
    return correct / len(y_true)


def inspect_duplicates_and_overlaps(df: pd.DataFrame) -> dict:
    """Analyze dataset for duplicate rows, unique combinations, and label overlaps."""
    records = []
    for _, row in df.iterrows():
        disease = row["disease"]
        syms = frozenset(row["symptoms"])
        records.append((disease, syms))

    counts = Counter(records)
    n_unique_pairs = len(counts)
    n_duplicates = sum(v - 1 for v in counts.values())

    symptom_to_diseases = defaultdict(set)
    for disease, syms in counts.keys():
        symptom_to_diseases[syms].add(disease)

    exact_overlaps = {s: d for s, d in symptom_to_diseases.items() if len(d) > 1}

    # Check subset relationships between different diseases
    unique_items = list(symptom_to_diseases.items())
    subset_count = 0
    for i in range(len(unique_items)):
        s1, d1 = unique_items[i]
        for j in range(len(unique_items)):
            if i == j:
                continue
            s2, d2 = unique_items[j]
            if s1.issubset(s2) and d1 != d2:
                subset_count += 1

    return {
        "raw_records": len(df),
        "unique_combinations": n_unique_pairs,
        "duplicate_rows": n_duplicates,
        "exact_overlapping_symptom_sets": len(exact_overlaps),
        "subset_overlapping_pairs": subset_count,
    }


def train():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------ #
    # 1. Load and preprocess
    # ------------------------------------------------------------------ #
    logger.info("Loading dataset from %s", DATASET_PATH)
    df, vocab = load_dataset(DATASET_PATH)
    logger.info("Raw records: %d", len(df))

    # ------------------------------------------------------------------ #
    # 2. Duplicate and overlap inspection
    # ------------------------------------------------------------------ #
    data_quality_report = inspect_duplicates_and_overlaps(df)
    logger.info(
        "Data quality check: Raw=%d, Unique pairs=%d, Duplicates=%d, Exact overlaps=%d, Subset overlaps=%d",
        data_quality_report["raw_records"],
        data_quality_report["unique_combinations"],
        data_quality_report["duplicate_rows"],
        data_quality_report["exact_overlapping_symptom_sets"],
        data_quality_report["subset_overlapping_pairs"],
    )

    # ------------------------------------------------------------------ #
    # 3. Deduplicate to eliminate train/test leakage
    # ------------------------------------------------------------------ #
    df["_sym_key"] = df["symptoms"].apply(lambda s: tuple(sorted(s)))
    df_dedup = df.drop_duplicates(subset=["disease", "_sym_key"]).drop(columns=["_sym_key"])
    logger.info(
        "After deduplication: %d records (removed %d duplicates)",
        len(df_dedup),
        len(df) - len(df_dedup),
    )

    # ------------------------------------------------------------------ #
    # 4. Build feature matrix
    # ------------------------------------------------------------------ #
    X, y, class_names = build_feature_matrix(df_dedup, vocab)
    logger.info("Feature matrix: %s, classes: %d", X.shape, len(class_names))

    # ------------------------------------------------------------------ #
    # 5. Encode labels
    # ------------------------------------------------------------------ #
    le = LabelEncoder()
    le.fit(class_names)
    y_enc = le.transform(y)

    # ------------------------------------------------------------------ #
    # 6. Stratified train/test split (no data leakage)
    # ------------------------------------------------------------------ #
    sss = StratifiedShuffleSplit(n_splits=1, test_size=TEST_SIZE, random_state=RANDOM_STATE)
    train_idx, test_idx = next(sss.split(X, y_enc))
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y_enc[train_idx], y_enc[test_idx]
    logger.info("Train: %d samples | Test: %d samples", len(X_train), len(X_test))

    # ------------------------------------------------------------------ #
    # 7. Train Random Forest baseline
    # ------------------------------------------------------------------ #
    logger.info("Training Random Forest (n_estimators=%d)...", RF_N_ESTIMATORS)
    rf = RandomForestClassifier(
        n_estimators=RF_N_ESTIMATORS,
        max_depth=RF_MAX_DEPTH,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)

    rf_pred = rf.predict(X_test)
    rf_proba = rf.predict_proba(X_test)
    rf_acc = accuracy_score(y_test, rf_pred)
    rf_f1 = f1_score(y_test, rf_pred, average="macro")
    rf_top3 = top_k_accuracy(y_test, rf_proba, list(range(len(class_names))), k=3)
    rf_report_dict = classification_report(
        y_test, rf_pred, target_names=le.classes_, output_dict=True, zero_division=0
    )
    rf_per_class_recall = {
        cls: float(rf_report_dict[cls]["recall"]) for cls in le.classes_ if cls in rf_report_dict
    }

    logger.info("RF  | Accuracy: %.4f | Macro F1: %.4f | Top-3 Acc: %.4f", rf_acc, rf_f1, rf_top3)

    # ------------------------------------------------------------------ #
    # 8. Train Logistic Regression baseline
    # ------------------------------------------------------------------ #
    logger.info("Training Logistic Regression...")
    lr = LogisticRegression(
        max_iter=2000,
        random_state=RANDOM_STATE,
        solver="lbfgs",
        C=1.0,
    )
    lr.fit(X_train, y_train)

    lr_pred = lr.predict(X_test)
    lr_proba = lr.predict_proba(X_test)
    lr_acc = accuracy_score(y_test, lr_pred)
    lr_f1 = f1_score(y_test, lr_pred, average="macro")
    lr_top3 = top_k_accuracy(y_test, lr_proba, list(range(len(class_names))), k=3)
    lr_report_dict = classification_report(
        y_test, lr_pred, target_names=le.classes_, output_dict=True, zero_division=0
    )
    lr_per_class_recall = {
        cls: float(lr_report_dict[cls]["recall"]) for cls in le.classes_ if cls in lr_report_dict
    }

    logger.info("LR  | Accuracy: %.4f | Macro F1: %.4f | Top-3 Acc: %.4f", lr_acc, lr_f1, lr_top3)

    # ------------------------------------------------------------------ #
    # 9. Log Per-class details
    # ------------------------------------------------------------------ #
    logger.info("\n=== Random Forest Classification Report ===\n%s",
                classification_report(y_test, rf_pred, target_names=le.classes_, zero_division=0))
    logger.info("\n=== Logistic Regression Classification Report ===\n%s",
                classification_report(y_test, lr_pred, target_names=le.classes_, zero_division=0))

    # ------------------------------------------------------------------ #
    # 10. Save artifacts and comprehensive metrics
    # ------------------------------------------------------------------ #
    best_model = rf

    joblib.dump(
        {
            "model": best_model,
            "label_encoder": le,
            "class_names": class_names,
            "model_version": "rf_v1",
        },
        MODEL_PATH,
    )
    vocab.save(VOCAB_PATH)

    cm = confusion_matrix(y_test, rf_pred)

    metrics = {
        "model_version": "rf_v1",
        "random_state": RANDOM_STATE,
        "test_size": TEST_SIZE,
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "n_classes": int(len(class_names)),
        "n_features": int(X.shape[1]),
        "data_quality": data_quality_report,
        "random_forest": {
            "accuracy": float(rf_acc),
            "macro_f1": float(rf_f1),
            "top3_accuracy": float(rf_top3),
            "n_estimators": RF_N_ESTIMATORS,
            "per_class_recall": rf_per_class_recall,
            "classification_report": rf_report_dict,
        },
        "logistic_regression": {
            "accuracy": float(lr_acc),
            "macro_f1": float(lr_f1),
            "top3_accuracy": float(lr_top3),
            "per_class_recall": lr_per_class_recall,
            "classification_report": lr_report_dict,
        },
        "confusion_matrix": cm.tolist(),
        "class_names": class_names,
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    logger.info("Model saved to %s", MODEL_PATH)
    logger.info("Vocabulary saved to %s", VOCAB_PATH)
    logger.info("Metrics saved to %s", METRICS_PATH)
    logger.info("Training complete.")

    return metrics


if __name__ == "__main__":
    train()
