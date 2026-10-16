# HealthTrack AI

An educational, AI-powered symptom assessment web application.

> ⚠️ **Not for clinical use.** This is an educational prototype built on a synthetic dataset. It does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.

---

## Features

- **Searchable symptom selector** with 131 clinical symptom descriptors
- **ML-powered assessment** using a Random Forest classifier trained on 41 disease categories
- **Ranked candidate conditions** with model vote fractions, descriptions, and precautions
- **Urgent symptom safety check** independent of the classifier
- **In-memory LRU cache** keyed on canonical symptom set + model version
- **Full medical disclaimer** on every response
- **Privacy-first** — no personal data stored or logged
- **Responsive UI** built with Next.js, TypeScript, and Tailwind CSS

---

## Architecture

```
HealthTrack AI/
├── backend/
│   ├── ml/
│   │   ├── preprocess.py      # Symptom normalization, vocabulary, feature building
│   │   ├── train.py           # Training pipeline (RF + LR), evaluation, model save
│   │   └── models/            # Saved model artifacts (generated)
│   ├── api/
│   │   ├── main.py            # FastAPI app with CORS, logging, lifespan
│   │   ├── routes.py          # /api/predict, /api/health, /api/symptoms
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── cache.py           # Thread-safe LRU cache
│   │   ├── model_loader.py    # Model singleton loader
│   │   └── recommender.py     # Disease description/precaution lookup
│   ├── tests/
│   │   ├── test_preprocess.py # Preprocessing and vocabulary tests
│   │   ├── test_api.py        # API integration tests
│   │   ├── test_recommender.py# Recommender tests
│   │   └── test_cache.py      # Cache behavior tests
│   ├── data/                  # Read-only CSV files (copies of originals)
│   └── requirements.txt
└── frontend/
    ├── app/                   # Next.js App Router pages
    │   ├── page.tsx           # Landing page
    │   └── assess/page.tsx    # Assessment + Results page
    ├── components/
    │   ├── SymptomSelector.tsx
    │   ├── ConditionCard.tsx
    │   ├── ScoreBar.tsx
    │   └── Disclaimer.tsx
    ├── lib/api.ts             # API client
    ├── types/api.ts           # TypeScript types
    └── hooks/useAssessment.ts # Assessment state hook
```

> 📖 **Detailed Subsystem Documentation**:
> - 🐍 [**Backend & Machine Learning Guide (FastAPI, Scikit-Learn, Pytest)**](backend/README.md)
> - ⚛️ [**Frontend Application Guide (Next.js 16, Tailwind CSS v4, Vitest)**](frontend/README.md)

---

## Dataset Provenance and Limitations

The four CSV files were obtained from a publicly available medical symptom dataset:

| File | Description |
|---|---|
| `dataset.csv` | 4,920 rows × 18 columns. Disease + up to 17 symptom columns. |
| `symptom_Description.csv` | Short descriptions for 41 diseases. |
| `symptom_precaution.csv` | Up to 4 precautions per disease. |
| `Symptom-severity.csv` | Severity weights for 133 symptoms (used for reference, not features). |

### Key Findings from Inspection

- **41 unique diseases**, exactly **120 records each** — perfectly balanced, synthetically generated.
- **4,616 of 4,920 rows are duplicates** (same symptom set + disease). The raw dataset was constructed by repeating symptom subsets for each disease.
- After deduplication, **304 unique (disease, symptom-set) combinations** remain.
- **Exact Overlap Across Disease Labels**: Exactly **0**. Every unique symptom combination in the dataset maps exclusively to a single disease label.
- **Subset Overlaps**: 103 cross-disease pairs where the symptom set of one disease is a strict subset of another (e.g., Chronic cholestasis symptoms are a subset of hepatitis A). This explains why partial symptom queries distribute decision tree votes across multiple plausible conditions.
- **131 unique symptoms** (after normalization). 3 symptoms had spacing/underscore inconsistencies between the dataset and severity file and were normalized.
- "Dimorphic hemmorhoids(piles)" has no entry in the description CSV (handled gracefully with fallback descriptions).

### Limitations

- The dataset is **synthetic**, not derived from real patient records.
- Because unseen symptom subsets are structurally similar to training subsets, **100% accuracy on the test set is expected** and reflects in-distribution performance on this synthetic data — not real-world diagnostic reliability.
- Symptoms are represented as binary presence/absence. Severity weights from the severity CSV are not used in the classifier.
- The model cannot detect rare diseases not in the 41-class label set.

---

## Model Training

```
Algorithm:    Random Forest (n_estimators=200, random_state=42)
Comparison:   Logistic Regression (max_iter=2000, C=1.0)
Split:        Stratified 80/20 on deduplicated dataset (304 records)
Features:     131-dimensional multi-hot binary vector (symptom presence)
```

### Single Split Evaluation (Deduplicated Test Set, n=61)

| Model | Accuracy | Macro F1 | Top-3 Accuracy | Per-Class Recall (Avg) |
|---|---|---|---|---|
| Random Forest (Primary, n_estimators=200) | 1.000 | 1.000 | 1.000 | 1.000 (all 41 classes) |
| Logistic Regression (Baseline, C=1.0) | 1.000 | 1.000 | 1.000 | 1.000 (all 41 classes) |

### Repeated Stratified Cross-Validation (5 Folds × 5 Repeats = 25 Folds, 1,520 Predictions)

To verify evaluation stability across varying train/test splits, we executed Repeated Stratified K-Fold Cross Validation (`RepeatedStratifiedKFold(n_splits=5, n_repeats=5, random_state=42)`):

| Model | Mean Accuracy | Std Dev (Acc) | Mean Macro F1 | Std Dev (F1) | Total Misclassifications |
|---|---|---|---|---|---|
| **Random Forest** | **1.0000** | **0.0000** | **1.0000** | **0.0000** | **0 / 1,520** |
| **Logistic Regression** | **1.0000** | **0.0000** | **1.0000** | **0.0000** | **0 / 1,520** |

#### Cross-Validation Configuration & Class Count Limitation
- **Constraint**: Across the 304 deduplicated records, sample counts per disease range from 5 to 10 (mean = 7.41, std = 1.70). Exactly 8 of the 41 classes have only 5 samples (*Fungal infection, Allergy, AIDS, Gastroenteritis, Paralysis (brain hemorrhage), Heart attack, Acne, Urinary tract infection*).
- **Limitation**: As a result,  = 5$ is the maximum valid stratified K-fold split where every fold contains at least 1 sample per class. Running a 10-fold stratified CV is mathematically impossible because classes with 5 samples cannot be represented across 10 folds.

#### Why the Dataset Yields 100% Accuracy (Dataset Separability Analysis)
1. **High Proportion of Pathognomonic (Exclusive) Symptoms**:
   - Out of 131 total symptoms in the vocabulary, **80 symptoms appear exclusively in one disease** (61.1%).
   - **32 out of 41 diseases** contain at least one symptom unique to that disease. When any of these symptoms is present, classification is deterministic.
2. **Orthogonal Combinations for Non-Exclusive Diseases**:
   - For the remaining 9 diseases (*Chronic cholestasis, Jaundice, Malaria, Chicken pox, hepatitis A, Hepatitis C, Hepatitis D, Heart attack, Hyperthyroidism*), their symptom profiles are distinguished by a **minimum Hamming distance of 2.0** (i.e. at least 2 distinct binary feature differences from any other condition).
3. **Absence of Label Noise**:
   - The dataset was created by combinatorially sampling predetermined symptom lists from clinical textbook definitions. Because there are no mislabeled records, atypical patient presentations, or stochastic noise, the classes are completely linearly and decision-tree separable.
4. **Split Invariance**:
   - Tested under 5-fold, 3-fold, and 2-fold cross-validation (training on just 50% of the data), both Random Forest and Logistic Regression consistently achieve 100% accuracy with zero variance.

> **Preventing Data Leakage**: All cross-validation and splits are performed strictly on the **304 deduplicated records**. Splitting the raw 4,920-row file would leak identical copies of 93.8% of samples across folds.
>
> **Clinical Validity Warning**: A score of 100% accuracy on synthetic, noise-free data reflects in-distribution rule recovery. In real clinical medicine, patient presentations are ambiguous, comorbid, and variable. This model must NEVER be used for clinical diagnosis.

---

## Installation

### Prerequisites

- Python ≥ 3.11
- Node.js ≥ 20

### Backend Setup

```bash
cd "HealthTrack AI/backend"
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Train the Model

```bash
# From backend/ directory
python3 -m ml.train
```

This generates:
- `ml/models/rf_model.joblib` — trained model + label encoder
- `ml/models/vocab.json` — canonical symptom vocabulary
- `ml/models/metrics.json` — training metrics

### Frontend Setup

```bash
cd "HealthTrack AI/frontend"
npm install
```

---

## Running

### Start the Backend

```bash
cd "HealthTrack AI/backend"
source .venv/bin/activate
uvicorn api.main:app --reload --port 8000
```

### Start the Frontend

```bash
cd "HealthTrack AI/frontend"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Documentation

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### `GET /api/health`

Returns service health and model status.

```json
{
  "status": "ok",
  "model_loaded": true,
  "model_version": "rf_v1",
  "vocabulary_size": 131
}
```

### `GET /api/symptoms`

Returns the full list of supported symptoms.

```json
{
  "symptoms": ["abdominal_pain", "acidity", ...]
}
```

### `POST /api/predict`

Assess a list of symptoms.

**Request:**
```json
{
  "symptoms": ["itching", "skin_rash", "nodal_skin_eruptions"]
}
```

**Response:**
```json
{
  "candidates": [
    {
      "rank": 1,
      "condition": "Fungal infection",
      "score": 0.785,
      "score_label": "model_vote_fraction",
      "description": "...",
      "precautions": ["..."],
      "matching_symptoms": ["itching", "skin_rash"]
    }
  ],
  "known_symptoms": ["itching", "skin_rash", "nodal_skin_eruptions"],
  "unknown_symptoms": [],
  "model_version": "rf_v1",
  "disclaimer": "...",
  "uncertainty_note": "..."
}
```

**Error responses:**

| Code | Condition |
|---|---|
| 422 | Empty symptoms list, all unknown symptoms, validation failure |
| 503 | Model not loaded (run training first) |

---

## Testing

### Backend Tests (pytest)

```bash
cd "HealthTrack AI/backend"
python3 -m pytest tests/ -v
```

61 unit and integration tests covering:
- Symptom normalization and alias handling
- Vocabulary encode/decode consistency
- Empty, unknown, duplicate, malformed inputs
- Feature vector consistency
- API endpoint validation
- Cache hits/misses/eviction/stats
- Recommender coverage and graceful missing data
- Model loading

### Frontend Tests (Vitest & React Testing Library)

```bash
cd "HealthTrack AI/frontend"
npm test
```

11 unit and component tests covering:
- API client methods (`getSymptoms`, `predict`, `checkHealth`), JSON serialization, and error parsing
- Medical `Disclaimer` presentation and emergency contact warnings
- `ScoreBar` vote-fraction percentage rendering and ARIA progressbar attributes
- `ConditionCard` candidate ranking, precaution lists, urgency alerts, and matched symptom chips
- `SymptomSelector` typeahead search filtering, selection from dropdown, and tag removal

---

## Design Trade-offs

| Decision | Rationale |
|---|---|
| Random Forest as primary | Natively supports `predict_proba`, interpretable vote fractions, handles multi-hot binary features well |
| Deduplication before split | Prevents structurally identical rows from leaking across train/test |
| In-memory cache only | Keeps the service stateless and privacy-preserving; no persistent storage of symptom queries |
| Scores labeled "vote_fraction" | Prevents misleading interpretation as calibrated probabilities |
| Urgent symptom check independent of classifier | Safety-critical guidance must not be gated on model confidence |

---

## Privacy Considerations

- No user data, session IDs, or symptom histories are persisted anywhere.
- The cache stores only anonymized prediction results keyed by a hash of the symptom set.
- Request logs record only HTTP method, path, status code, and latency — no symptom data.
- No analytics, telemetry, or third-party services are used.

---

## Medical Disclaimer

**HealthTrack AI is an educational prototype and does not provide medical advice, diagnosis, or treatment.**

The results are generated by a machine learning model trained on a synthetic dataset and have not been clinically validated. The model's output must not be used as the basis for any clinical or personal health decision. Always consult a qualified healthcare professional for any health concerns. In an emergency, call your local emergency services immediately.

The dataset was not derived from real patient records. Model scores are not calibrated disease probabilities.
