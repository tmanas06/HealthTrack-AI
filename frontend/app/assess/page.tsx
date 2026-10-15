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
      .catch(() => setSymptomsError("Could not load symptom list. Ensure the backend is running on port 8000."));
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/30 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-teal-600"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition-all group-hover:border-teal-300 group-hover:bg-teal-50">
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-200">
              <svg className="h-4 w-4" width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-slate-800">
              HealthTrack <span className="text-teal-600">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Prototype
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8 sm:py-12">
        {/* Page Title & Context */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3.5 py-1 text-xs font-semibold text-teal-700 mb-3 shadow-sm">
            <span>🩺</span>
            <span>Intelligent Clinical Decision Support Prototype</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
            Symptom Assessment
          </h1>
          <p className="mx-auto mt-2.5 max-w-xl text-sm sm:text-base text-slate-500">
            Select the symptoms you are experiencing to evaluate potential condition matches
            ranked by our machine learning model.
          </p>
        </div>

        {/* Step 1: Symptom Selector Card */}
        {state.status !== "success" && (
          <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-xl shadow-teal-900/5 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-md shadow-teal-200">
                  1
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Choose Your Symptoms</h2>
                  <p className="text-xs text-slate-400">Select at least one symptom to begin inference</p>
                </div>
              </div>

              {selected.length > 0 && (
                <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-700">
                  {selected.length} Selected
                </span>
              )}
            </div>

            {symptomsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-red-800">Connection Error</h3>
                    <p className="mt-1">{symptomsError}</p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              </div>
            ) : allSymptoms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-200 border-t-teal-600 mb-3"></div>
                <p className="text-sm font-medium">Loading medical vocabulary...</p>
                <p className="text-xs text-slate-400 mt-1">Connecting to FastAPI inference engine</p>
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

            {/* Error Message */}
            {state.status === "error" && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-rose-500 flex-shrink-0" width={20} height={20} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p>
                    <strong>Assessment Error:</strong> {state.message}
                  </p>
                </div>
              </div>
            )}

            {/* Assessment CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                {selected.length === 0 ? (
                  <span>Please select symptoms above or choose an example preset</span>
                ) : (
                  <span>
                    Ready to evaluate <strong className="text-slate-800">{selected.length}</strong> symptom{selected.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <button
                id="assess-submit-btn"
                type="button"
                onClick={handleSubmit}
                disabled={selected.length === 0 || state.status === "loading"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-200/80 transition-all duration-200 hover:from-teal-600 hover:to-cyan-700 hover:shadow-xl hover:shadow-teal-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-teal-200"
              >
                {state.status === "loading" ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" width={16} height={16} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Evaluating Symptoms...</span>
                  </>
                ) : (
                  <>
                    <span>Assess Symptoms</span>
                    <svg className="h-4 w-4" width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Assessment Results */}
        {state.status === "success" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Results Header Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-xl shadow-teal-900/5 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">
                    <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
                    ML Assessment Complete
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Potential Condition Matches</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Evaluated across 41 disease categories for{" "}
                    <strong className="text-slate-800">{state.data.known_symptoms.length}</strong> recognized symptom{state.data.known_symptoms.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    id="new-assessment-btn"
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 hover:shadow"
                  >
                    <svg className="h-4 w-4 text-teal-600" width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    New Assessment
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4" width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>
              </div>

              {/* Symptom Chips Breakdown */}
              <div className="pt-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Input Symptoms Evaluated
                </span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {state.data.known_symptoms.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50/80 px-3 py-1 text-xs font-semibold text-teal-800"
                    >
                      <svg className="h-3 w-3 text-teal-600" width={12} height={12} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {formatSymptomLabel(s)}
                    </span>
                  ))}
                  {state.data.unknown_symptoms.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                      title="Not found in training vocabulary"
                    >
                      <span>⚠️</span>
                      {formatSymptomLabel(s)} (unrecognized)
                    </span>
                  ))}
                </div>
              </div>

              {/* Uncertainty Guidance Banner */}
              <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-xs sm:text-sm text-sky-800">
                <div className="flex items-start gap-2.5">
                  <svg className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="font-semibold text-sky-900">Score Interpretation:</strong>{" "}
                    {state.data.uncertainty_note}
                  </div>
                </div>
              </div>
            </div>

            {/* Condition Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Ranked Results ({state.data.candidates.length})</h3>
                <span className="text-xs text-slate-400">Ranked by Random Forest ensemble votes</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {state.data.candidates.map((candidate) => (
                  <ConditionCard key={candidate.rank} candidate={candidate} />
                ))}
              </div>
            </div>

            {/* Prominent Medical Disclaimer */}
            <div className="pt-4">
              <Disclaimer />
            </div>

            {/* Model Metadata Footer */}
            <div className="pb-8 text-center text-xs text-slate-400">
              Inference Engine: {state.data.model_version} · Trained on 41 Disease Categories · HealthTrack AI
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
