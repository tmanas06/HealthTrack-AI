# HealthTrack AI — Frontend

A responsive web application for educational symptom assessment built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Vitest**.

> ⚠️ **Educational Prototype Only.** This application is designed for demonstration and educational purposes. It does not provide medical diagnoses or advice. In an emergency, always contact local emergency services.

---

## Features

- **Interactive Symptom Search & Auto-Suggest**: Typeahead search across 131 canonical symptom terms with real-time filtering and keyboard navigation.
- **Dynamic Tag Management**: Visual chips for selected symptoms with one-click removal and clear-all functionality.
- **Ranked Probabilistic Predictions**: Displays top-5 matching conditions with vote fraction progress bars, condition descriptions, and recommended precautions.
- **Emergency / High-Risk Alerts**: Automatic visual flags ("Seek care") for acute and urgent conditions.
- **Transparent Model Attribution**: Clear distinction between recognized and unrecognized symptoms, model version disclosure, and prominent medical disclaimers.

---

## Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React & inline semantic SVGs
- **Testing**: Vitest, React Testing Library, jsdom

---

## Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx         # Root layout with fonts, metadata, and styles
│   ├── page.tsx           # HealthTrack AI landing page & hero
│   ├── assess/
│   │   └── page.tsx       # Symptom selector & assessment results page
│   └── globals.css        # Global CSS variables & Tailwind v4 theme
├── components/
│   ├── SymptomSelector.tsx # Typeahead search, dropdown, and chip manager
│   ├── ConditionCard.tsx   # Condition card with score, precautions, & match tags
│   ├── ScoreBar.tsx        # Visual vote-fraction progress bar & rank indicator
│   └── Disclaimer.tsx      # Reusable medical warning banner
├── hooks/
│   └── useAssessment.ts    # React state hook for assessment workflows
├── lib/
│   ├── api.ts              # Typed backend API client (fetch)
│   └── utils.ts            # Class merging utility (clsx + tailwind-merge)
├── types/
│   └── api.ts              # TypeScript schemas matching FastAPI models
├── __tests__/
│   ├── api.test.ts         # Vitest unit tests for API client
│   └── components.test.tsx # Component rendering & user interaction tests
└── vitest.config.mts       # Vitest test configuration
```

---

## Environment Configuration

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```bash
npm run build
npm start
```

### 4. Running Tests

```bash
npm test
```

Runs the 11 Vitest unit and integration test suites in jsdom covering:
- API client responses, parameter serialization, and error message parsing
- `Disclaimer` medical warning text and accessibility
- `ScoreBar` percentage formatting and progressbar accessibility attributes
- `ConditionCard` rankings, precautions, urgency alerts, and symptom tags
- `SymptomSelector` search filtering, option selection, and chip removal

---

## Integration with Backend

The frontend communicates with the FastAPI backend at `http://localhost:8000`:
- `GET /api/health`: Verifies backend availability and model status.
- `GET /api/symptoms`: Retrieves list of 131 supported symptoms for auto-complete.
- `POST /api/predict`: Submits selected symptoms and receives candidate conditions.
