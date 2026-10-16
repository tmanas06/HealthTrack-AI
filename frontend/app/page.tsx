import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col justify-between">
      {/* Restrained Healthcare Navigation Header */}
      <header className="border-b border-stone-200/80 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1b4332] text-white text-sm font-semibold">
              HT
            </div>
            <div>
              <span className="font-semibold text-stone-900 tracking-tight">
                HealthTrack <span className="font-normal text-stone-500">AI</span>
              </span>
              <span className="ml-2 text-[11px] uppercase tracking-wider text-stone-600 border border-stone-200 bg-stone-50 px-1.5 py-0.5 rounded">
                Prototype
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/assess"
              className="text-stone-600 hover:text-stone-900 transition-colors hidden sm:inline"
            >
              Symptom Checker
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-500 hover:text-stone-800 transition-colors hidden sm:inline"
            >
              API Reference
            </a>
            <Link
              href="/assess"
              id="header-start-btn"
              className="rounded-md bg-[#1b4332] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#143225] transition-colors"
            >
              Start Assessment
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Editorial Hero Section */}
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pt-10 pb-8 sm:pt-12 sm:pb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600 mb-4 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-700"></span>
            <span>Non-Diagnostic Clinical Demonstration Tool</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 leading-[1.2]">
            Understand your symptoms.
            <br />
            Know your next step.
          </h1>

          <p className="mx-auto mt-3.5 sm:mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-stone-600">
            HealthTrack AI evaluates user-selected symptoms against 41 conditions using a trained machine-learning model. Get ranked candidate observations and recommended precautions to inform your conversation with a doctor.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/assess"
              id="start-assessment-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-[#1b4332] px-7 py-3 text-sm font-medium text-white hover:bg-[#143225] transition-colors shadow-xs"
            >
              Start Symptom Assessment
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              How It Works
            </a>
          </div>

          <div className="mt-4 text-xs text-stone-600 flex items-center justify-center gap-4">
            <span>Private & In-Memory</span>
            <span>·</span>
            <span>No Account Required</span>
            <span>·</span>
            <span>Not for Clinical Diagnosis</span>
          </div>
        </section>

        {/* 3-Step Process Section */}
        <section id="how-it-works" className="border-t border-b border-stone-200/70 bg-white py-10 sm:py-12">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-7 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                A Transparent, 3-Step Assessment
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Designed to organize your symptoms before consulting a physician.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-stone-200 p-5 bg-[#faf9f6]">
                <div className="text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2">
                  Step 01
                </div>
                <h3 className="font-semibold text-stone-900 text-base mb-1.5">
                  Select your symptoms
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Search or browse across 131 standardized clinical symptom terms. Add indicators with a single click.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 p-5 bg-[#faf9f6]">
                <div className="text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2">
                  Step 02
                </div>
                <h3 className="font-semibold text-stone-900 text-base mb-1.5">
                  Ensemble model evaluation
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  A Random Forest classifier analyzes the feature vector across 41 conditions and calculates tree vote fractions.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 p-5 bg-[#faf9f6]">
                <div className="text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2">
                  Step 03
                </div>
                <h3 className="font-semibold text-stone-900 text-base mb-1.5">
                  Review guidance & care
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Examine leading condition matches, matched indicators, general precautions, and flags for emergency evaluation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Foundation & Disclaimers Section */}
        <section className="mx-auto max-w-4xl px-6 py-8 sm:py-10">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-stone-900 mb-2">
                Clinical Scope & Transparency
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                The model is trained on a standardized dataset of 41 conditions and 131 symptoms. Scores reflect decision tree agreement (vote fractions), not calibrated biological probabilities.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-stone-900 mb-2">
                Patient Privacy by Design
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                HealthTrack AI does not store, track, or share your input symptoms. Predictions are processed entirely in memory, and queries are stateless.
              </p>
            </div>
          </div>

          <Disclaimer />
        </section>
      </main>

      {/* Restrained Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-xs text-stone-500">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            HealthTrack AI — Educational Engineering Prototype · Not for clinical diagnosis
          </div>
          <div className="flex gap-4">
            <Link href="/assess" className="hover:text-stone-800 transition-colors">
              Assessment
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-800 transition-colors"
            >
              API Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
