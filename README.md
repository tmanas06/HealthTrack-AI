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

### Evaluation Metrics (on deduplicated test set, n=61)

| Model | Accuracy | Macro F1 | Top-3 Accuracy | Per-Class Recall (Avg) |
|---|---|---|---|---|
| Random Forest (Primary) | 1.000 | 1.000 | 1.000 | 1.000 (all 41 classes) |
| Logistic Regression (Baseline) | 1.000 | 1.000 | 1.000 | 1.000 (all 41 classes) |

> **Preventing Data Leakage**: The stratified 80/20 train/test split was strictly applied to the **304 deduplicated records** (243 train, 61 test) rather than the raw 4,920 records. Splitting the raw data would have caused 93.8% of test records to be identical copies of training records, creating artificial test leakage.
>
> **Important Caveat**: While both models achieve perfect scores on this held-out deduplicated split, these metrics solely measure in-distribution classification on synthetic data where combinations are distinct. They **must not** be interpreted as clinical diagnostic reliability or real-world accuracy.

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
