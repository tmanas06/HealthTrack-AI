import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";

const features = [
  {
    icon: (
      <svg className="h-6 w-6 text-teal-600" width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "131 Symptom Vocabulary",
    description: "Standardized clinical terminology mapping spanning respiratory, digestive, neuro, and dermatological conditions.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-teal-600" width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Ensemble ML Engine",
    description: "Trained Random Forest decision tree ensemble with vote-fraction scoring across 41 disease categories.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-teal-600" width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Ranked Insights & Care",
    description: "Multi-class probabilistic ranking accompanied by clinical descriptions, matched symptoms, and precautions.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-teal-600" width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Privacy by Design",
    description: "100% in-memory processing. Zero persistent health records, tracking cookies, or external model APIs.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/30 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 shadow-md shadow-teal-200 text-white">
              <svg className="h-5 w-5" width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-800">
                HealthTrack <span className="text-teal-600">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Prototype Only
            </span>
            <Link
              href="/assess"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-teal-200 hover:from-teal-600 hover:to-cyan-700 transition-all"
            >
              Start Assessment
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-teal-800 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
            <span>Machine Learning Symptom Assessment Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Intelligent Health Insights.
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent">
              Ranked Condition Matching.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
            Select your clinical symptoms and receive ranked condition predictions powered
            by a trained Random Forest model. Complete with precautionary guidelines and emergency flags.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/assess"
              id="start-assessment-btn"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-200 transition-all duration-200 hover:from-teal-600 hover:to-cyan-700 hover:shadow-2xl hover:shadow-teal-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-teal-200"
            >
              <span>Begin Symptom Assessment</span>
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-6 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              How It Works
            </a>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {[
              { value: "41", label: "Conditions Modeled" },
              { value: "131", label: "Symptom Vocabulary" },
              { value: "Top-3", label: "Ranked Predictions" },
              { value: "100%", label: "Privacy Preserved" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-sm"
              >
                <div className="text-3xl font-extrabold text-teal-600">{stat.value}</div>
                <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / 3-Step Workflow */}
      <section id="how-it-works" className="border-t border-slate-200/60 bg-white/60 py-20 backdrop-blur-xs">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Simple 3-Step Process
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-800">
              How HealthTrack AI Works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Select Symptoms",
                desc: "Search or browse 131 clinical symptoms across respiratory, digestive, skin, and neurological categories.",
              },
              {
                step: "02",
                title: "Ensemble Inference",
                desc: "Our FastAPI engine encodes your symptoms into a multi-hot vector and queries 200 trained decision trees.",
              },
              {
                step: "03",
                title: "Actionable Guidance",
                desc: "Receive ranked conditions, model vote scores, condition summaries, and clinical precautions.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover:border-teal-200 hover:shadow-md transition-all"
              >
                <div className="text-3xl font-extrabold text-teal-500/30 mb-2">{item.step}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Architecture & Capabilities
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-800">
              Built on Genuine Machine Learning
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500 text-sm sm:text-base">
              No third-party LLM hallucinations or hardcoded decision rules. Real scikit-learn models
              serving inference via FastAPI.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="group rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                  {feat.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-slate-800">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Disclaimer Banner */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <Disclaimer />
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 py-8 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            HealthTrack AI — Educational Medical Prototype · Not for clinical diagnosis
          </div>
          <div className="flex gap-4">
            <Link href="/assess" className="hover:text-teal-600 transition-colors">
              Assessment
            </Link>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors">
              API Docs
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
