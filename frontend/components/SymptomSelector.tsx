"use client";

import { useState, useMemo, useRef, useEffect } from "react";

interface SymptomSelectorProps {
  allSymptoms: string[];
  selected: string[];
  onAdd: (symptom: string) => void;
  onRemove: (symptom: string) => void;
  onClear?: () => void;
  onSelectPreset?: (symptoms: string[]) => void;
  maxSymptoms?: number;
}

const CATEGORIES: Record<string, { label: string; icon: string; symptoms: string[] }> = {
  Popular: {
    label: "Common",
    icon: "🌟",
    symptoms: [
      "fatigue",
      "high_fever",
      "headache",
      "cough",
      "joint_pain",
      "nausea",
      "vomiting",
      "itching",
      "skin_rash",
      "chills",
      "chest_pain",
      "abdominal_pain",
      "breathlessness",
    ],
  },
  Respiratory: {
    label: "Respiratory",
    icon: "🫁",
    symptoms: [
      "cough",
      "breathlessness",
      "continuous_sneezing",
      "phlegm",
      "chest_pain",
      "throat_irritation",
      "sinus_pressure",
      "runny_nose",
      "congestion",
    ],
  },
  Digestive: {
    label: "Digestive",
    icon: "🍽️",
    symptoms: [
      "abdominal_pain",
      "nausea",
      "vomiting",
      "acidity",
      "indigestion",
      "diarrhoea",
      "constipation",
      "stomach_pain",
      "loss_of_appetite",
      "yellowish_skin",
    ],
  },
  Neurological: {
    label: "Neuro / Body",
    icon: "🧠",
    symptoms: [
      "headache",
      "joint_pain",
      "muscle_pain",
      "back_pain",
      "neck_pain",
      "dizziness",
      "loss_of_balance",
      "altered_sensorium",
      "visual_disturbances",
    ],
  },
  Skin: {
    label: "Skin / Allergy",
    icon: "🧬",
    symptoms: [
      "itching",
      "skin_rash",
      "nodal_skin_eruptions",
      "blister",
      "red_sore_around_nose",
      "yellow_crust_ooze",
      "pus_filled_pimples",
      "blackheads",
      "skin_peeling",
    ],
  },
};

const PRESETS = [
  {
    name: "Common Cold",
    icon: "🤧",
    symptoms: ["continuous_sneezing", "chills", "fatigue", "cough", "high_fever", "headache"],
  },
  {
    name: "Allergic Reaction",
    icon: "🌿",
    symptoms: ["continuous_sneezing", "shivering", "chills", "watering_from_eyes"],
  },
  {
    name: "Migraine Attack",
    icon: "⚡",
    symptoms: ["headache", "acidity", "indigestion", "blurred_and_distorted_vision", "excessive_hunger"],
  },
  {
    name: "Skin Infection",
    icon: "🩹",
    symptoms: ["itching", "skin_rash", "nodal_skin_eruptions", "dischromic__patches"],
  },
];

function formatSymptomLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SymptomSelector({
  allSymptoms,
  selected,
  onAdd,
  onRemove,
  onClear,
  onSelectPreset,
  maxSymptoms = 17,
}: SymptomSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Popular");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return allSymptoms.slice(0, 30);
    const q = query.toLowerCase().replace(/\s+/g, "_");
    return allSymptoms
      .filter(
        (s) =>
          s.toLowerCase().includes(q) ||
          formatSymptomLabel(s).toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 20);
  }, [query, allSymptoms]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(symptom: string) {
    if (!selected.includes(symptom) && selected.length < maxSymptoms) {
      onAdd(symptom);
    }
    setQuery("");
    inputRef.current?.focus();
  }

  function handleToggle(symptom: string) {
    if (selected.includes(symptom)) {
      onRemove(symptom);
    } else {
      if (selected.length < maxSymptoms) {
        onAdd(symptom);
      }
    }
  }

  function handleClearAll() {
    if (onClear) {
      onClear();
    } else {
      selected.forEach(onRemove);
    }
  }

  const isAtMax = selected.length >= maxSymptoms;

  return (
    <div className="space-y-6">
      {/* Quick Test Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Examples (Click to test)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                if (onSelectPreset) {
                  onSelectPreset(preset.symptoms);
                } else {
                  handleClearAll();
                  preset.symptoms.forEach((s) => {
                    if (allSymptoms.includes(s)) onAdd(s);
                  });
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-teal-300 hover:bg-teal-50/70 hover:text-teal-700 hover:shadow"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Box */}
      <div ref={containerRef} className="relative">
        <label htmlFor="symptom-search" className="mb-1.5 block text-sm font-medium text-slate-700">
          Search symptoms
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <svg className="h-4 w-4 text-teal-600" width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="symptom-search"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={isAtMax ? `Maximum ${maxSymptoms} symptoms selected` : "Type to search symptoms..."}
            disabled={isAtMax}
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="symptom-dropdown"
            aria-expanded={open}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown list */}
        {open && filtered.length > 0 && !isAtMax && (
          <div
            id="symptom-dropdown"
            role="listbox"
            aria-label="Symptom suggestions"
            className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5"
          >
            <ul className="max-h-60 overflow-y-auto py-1">
              {filtered.map((symptom) => {
                const isSelected = selected.includes(symptom);
                return (
                  <li
                    key={symptom}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => !isSelected && handleSelect(symptom)}
                    className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      isSelected
                        ? "cursor-default bg-teal-50/70 text-teal-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{formatSymptomLabel(symptom)}</span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs text-teal-600">
                        <svg className="h-4 w-4" width={16} height={16} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Selected
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Click to add</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Category Tabs & Quick-Select Pills */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Browse by Category
          </span>
          <span className="text-xs text-slate-400">
            Click to toggle symptom
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3.5 pb-2 border-b border-slate-200/60">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeCategory === key
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/60"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Symptoms in Active Category */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES[activeCategory]?.symptoms.map((symptom) => {
            const isSelected = selected.includes(symptom);
            return (
              <button
                key={symptom}
                type="button"
                onClick={() => handleToggle(symptom)}
                disabled={!isSelected && isAtMax}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-200 hover:bg-teal-700"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 hover:text-teal-700"
                } ${!isSelected && isAtMax ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <span>{formatSymptomLabel(symptom)}</span>
                {isSelected ? (
                  <svg className="h-3 w-3" width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3 text-slate-400" width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected symptoms tray */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Selected symptoms{" "}
            <span className="ml-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800">
              {selected.length}
            </span>
          </span>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-red-600 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {selected.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 py-8 text-center">
            <svg className="mx-auto h-8 w-8 text-slate-300 mb-2" width={32} height={32} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-slate-500 font-medium">No symptoms selected yet</p>
            <p className="text-xs text-slate-400 mt-1">Use the search above or click any category to add symptoms</p>
          </div>
        ) : (
          <div role="list" aria-label="Selected symptoms" className="flex flex-wrap gap-2">
            {selected.map((symptom) => (
              <div
                key={symptom}
                role="listitem"
                className="group flex items-center gap-1.5 rounded-full border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50/80 px-3 py-1.5 text-sm font-medium text-teal-800 shadow-sm transition-all hover:border-teal-300 hover:shadow"
              >
                <span>{formatSymptomLabel(symptom)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${formatSymptomLabel(symptom)}`}
                  onClick={() => onRemove(symptom)}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-teal-400 hover:bg-teal-200 hover:text-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-400 transition-colors"
                >
                  <svg className="h-3 w-3" width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
