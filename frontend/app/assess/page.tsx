"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SymptomSelector } from "@/components/SymptomSelector";
import { ConditionCard } from "@/components/ConditionCard";
import { Disclaimer } from "@/components/Disclaimer";
import { getSymptoms, predict } from "@/lib/api";
import { PredictResponse } from "@/types/api";

function formatSymptomLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type PageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: PredictResponse }
  | { status: "error"; message: string };

export default function AssessPage() {
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [state, setState] = useState<PageState>({ status: "idle" });
  const [symptomsError, setSymptomsError] = useState<string | null>(null);

  // Load symptoms from API
  useEffect(() => {
    getSymptoms()
      .then((res) => setAllSymptoms(res.symptoms))
      .catch(() =>
        setSymptomsError("Could not load symptom list. Ensure the backend server is running on port 8000.")
      );
  }, []);

  const handleAdd = useCallback((s: string) => {
    setSelected((prev) => (prev.includes(s) ? prev : [...prev, s]));
  }, []);

  const handleRemove = useCallback((s: string) => {
    setSelected((prev) => prev.filter((x) => x !== s));
  }, []);

  const handleClear = useCallback(() => {
    setSelected([]);
  }, []);

  const handlePreset = useCallback((symptoms: string[]) => {
    setSelected(symptoms);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selected.length === 0) return;
    setState({ status: "loading" });
    try {
      const data = await predict({ symptoms: selected });
      setState({ status: "success", data });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setState({ status: "error", message });
    }
  }, [selected]);

  const handleReset = useCallback(() => {
    setState({ status: "idle" });
    setSelected([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col justify-between">
      {/* Restrained Navigation Header */}
      <header className="border-b border-stone-200/80 bg-white sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <svg
              className="h-3.5 w-3.5"
              width={14}
              height={14}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Overview</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 text-sm tracking-tight">
              HealthTrack <span className="font-normal text-stone-500">AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-stone-600 border border-stone-200 bg-stone-50 px-1 py-0.5 rounded">
              Assessment
            </span>
          </div>

          <div className="text-xs text-stone-600">
            Non-Diagnostic
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl w-full px-6 py-6 sm:py-7 flex-1">
        {/* Page Heading */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Symptom Assessment
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
            Select the symptoms you are currently experiencing to evaluate potential condition matches based on our trained machine-learning model.
          </p>
        </div>

        {/* ========================================================= */}
        {/* STATE 1: SELECTION FORM */}
        {/* ========================================================= */}
        {state.status !== "success" && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Symptom Selection Interface (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              <div className="border-b border-stone-200/80 pb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-700">
                  Select Symptoms
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Search 131 symptoms or browse by clinical category.
                </p>
              </div>

              {symptomsError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-800">
                  <p className="font-semibold">Unable to load symptoms list</p>
                  <p className="mt-1">{symptomsError}</p>
                </div>
              ) : allSymptoms.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-[#1b4332] mx-auto mb-2"></div>
                  Loading clinical vocabulary...
                </div>
              ) : (
                <SymptomSelector
                  allSymptoms={allSymptoms}
                  selected={selected}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                  onClear={handleClear}
                  onSelectPreset={handlePreset}
                />
              )}
            </div>

            {/* Right Column: Selected Summary & Action Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs">
                <div className="border-b border-stone-100 pb-3 mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Selected Summary
                  </h3>
                  <span className="text-xs font-semibold text-[#1b4332]">
                    {selected.length} symptom{selected.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {selected.length === 0 ? (
                  <p className="text-xs text-stone-500 py-3 leading-relaxed">
                    No symptoms added yet. Select at least one symptom to run the assessment.
                  </p>
                ) : (
                  <div className="space-y-2 py-1 mb-4 max-h-48 overflow-y-auto">
                    {selected.map((s) => (
                      <div
                        key={s}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded bg-stone-50 border border-stone-200/60"
                      >
                        <span className="text-stone-800 font-medium truncate pr-2">
                          {formatSymptomLabel(s)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(s)}
                          className="text-stone-400 hover:text-stone-700"
                          aria-label={`Remove ${formatSymptomLabel(s)}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Primary Assessment CTA Button */}
                <button
                  id="assess-submit-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={selected.length === 0 || state.status === "loading"}
                  className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-[#1b4332] px-4 py-3 text-xs sm:text-sm font-medium text-white hover:bg-[#143225] transition-colors shadow-2xs disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
                >
                  {state.status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                      Evaluating Symptoms...
                    </span>
                  ) : (
                    <span>Assess Symptoms ({selected.length})</span>
                  )}
                </button>

                {/* Error message */}
                {state.status === "error" && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <p className="font-semibold">Error</p>
                    <p className="mt-0.5">{state.message}</p>
                  </div>
                )}

                {/* Urgent Safety Warning - Clearly distinguished from form guidance */}
                <div className="mt-4 rounded-lg border border-amber-200/90 bg-amber-50/70 p-3 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-950 mb-1">
                    <svg
                      className="h-3.5 w-3.5 text-amber-700 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Emergency Warning</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    If you experience sudden severe chest pain, breathing difficulty, or confusion, call emergency services immediately. Do not rely on self-assessment.
                  </p>
                </div>
              </div>

              <Disclaimer compact />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STATE 2: RESULTS VIEW */}
        {/* ========================================================= */}
        {state.status === "success" && (
          <div className="space-y-5">
            {/* Results Header Card */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-3.5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-700"></span>
                    Evaluation Complete
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                    Assessment Results
                  </h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-stone-600">
                    Showing top {state.data.candidates.length} condition candidates for{" "}
                    <strong>{state.data.known_symptoms.length}</strong> recognized symptom
                    {state.data.known_symptoms.length !== 1 ? "s" : ""}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="new-assessment-btn"
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                  >
                    <span>↺</span>
                    <span>New Assessment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors hidden sm:inline-flex"
                  >
                    Print Summary
                  </button>
                </div>
              </div>

              {/* Input Symptoms Chip Breakdown */}
              <div className="pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
                  Input Symptoms Evaluated
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {state.data.known_symptoms.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-md border border-[#c8d8cb] bg-[#eef3ef] px-2.5 py-0.5 text-xs font-medium text-[#1b4332]"
                    >
                      {formatSymptomLabel(s)}
                    </span>
                  ))}
                  {state.data.unknown_symptoms.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
                    >
                      {formatSymptomLabel(s)} (unrecognized)
                    </span>
                  ))}
                </div>
              </div>

              {/* Score Interpretation Notice - Compact presentation */}
              <div className="mt-3 rounded-lg border border-stone-200/90 bg-stone-50/80 px-3.5 py-2 text-xs text-stone-600 leading-snug">
                <span className="font-semibold text-stone-700">Model Score Semantics:</span>{" "}
                <span>{state.data.uncertainty_note}</span>
              </div>
            </div>

            {/* Leading Candidate Match (Prominent Result - scan-friendly vertical spacing) */}
            {state.data.candidates.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                    Highest-Ranked Candidate
                  </h3>
                  <span className="text-xs text-stone-500">Leading statistical observation</span>
                </div>
                <ConditionCard candidate={state.data.candidates[0]} isLeading={true} />
              </div>
            )}

            {/* Secondary Candidate Conditions (Compact Grid) */}
            {state.data.candidates.length > 1 && (
              <div className="pt-1">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                    Other Potential Matches ({state.data.candidates.length - 1})
                  </h3>
                  <span className="text-xs text-stone-500">Secondary candidates</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {state.data.candidates.slice(1).map((candidate) => (
                    <ConditionCard key={candidate.rank} candidate={candidate} isLeading={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Medical Disclaimer Banner */}
            <div className="pt-1">
              <Disclaimer />
            </div>

            {/* Model Metadata Footer */}
            <div className="text-center text-xs text-stone-400 py-2">
              Model: {state.data.model_version} · Trained on 41 Disease Categories · HealthTrack AI
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 text-xs text-stone-500 text-center">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HealthTrack AI — Educational Healthcare Prototype</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-stone-800">
              Overview
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-800"
            >
              API Reference
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
