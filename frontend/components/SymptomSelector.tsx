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

const CATEGORIES: Record<string, { label: string; symptoms: string[] }> = {
  Popular: {
    label: "Common",
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
    label: "Neuro & Body",
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
    label: "Skin & Allergy",
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
    symptoms: ["continuous_sneezing", "chills", "fatigue", "cough", "high_fever", "headache"],
  },
  {
    name: "Allergic Reaction",
    symptoms: ["continuous_sneezing", "shivering", "chills", "watering_from_eyes"],
  },
  {
    name: "Migraine Attack",
    symptoms: ["headache", "acidity", "indigestion", "blurred_and_distorted_vision", "excessive_hunger"],
  },
  {
    name: "Skin Infection",
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
  const [activeIndex, setActiveIndex] = useState<number>(-1);
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
        setActiveIndex(-1);
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
    setActiveIndex(-1);
    setOpen(false);
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (isAtMax) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(0);
      } else if (filtered.length > 0) {
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open && filtered.length > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      }
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        const chosen = filtered[activeIndex];
        if (!selected.includes(chosen)) {
          handleSelect(chosen);
        }
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      }
    }
  }

  return (
    <div className="space-y-5">
      {/* Search Input Combobox */}
      <div ref={containerRef} className="relative">
        <label
          htmlFor="symptom-search"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600"
        >
          Search symptoms
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-stone-400">
            <svg
              className="h-4 w-4"
              width={16}
              height={16}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            id="symptom-search"
            ref={inputRef}
            type="text"
            role="combobox"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => {
              setOpen(true);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isAtMax
                ? `Maximum ${maxSymptoms} symptoms selected`
                : "Type to search symptoms (e.g. fever, headache, cough)..."
            }
            disabled={isAtMax}
            className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-10 pr-10 text-sm text-stone-900 placeholder-stone-400 shadow-2xs transition-colors focus:border-[#1b4332] focus:outline-none focus:ring-1 focus:ring-[#1b4332] disabled:cursor-not-allowed disabled:bg-stone-50"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="symptom-dropdown"
            aria-expanded={open && filtered.length > 0 && !isAtMax}
            aria-haspopup="listbox"
            aria-activedescendant={
              open && activeIndex >= 0 ? `symptom-option-${activeIndex}` : undefined
            }
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600"
              aria-label="Clear search input"
            >
              <svg
                className="h-4 w-4"
                width={16}
                height={16}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Combobox Dropdown */}
        {open && filtered.length > 0 && !isAtMax && (
          <div
            id="symptom-dropdown"
            role="listbox"
            aria-label="Symptom suggestions"
            className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-md ring-1 ring-black/5"
          >
            <ul>
              {filtered.map((symptom, index) => {
                const isSelected = selected.includes(symptom);
                const isActive = activeIndex === index;
                return (
                  <li
                    key={symptom}
                    id={`symptom-option-${index}`}
                    role="option"
                    aria-selected={isSelected || isActive}
                    onClick={() => !isSelected && handleSelect(symptom)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex cursor-pointer items-center justify-between px-3.5 py-2 text-xs sm:text-sm transition-colors ${
                      isActive
                        ? "bg-[#eef3ef] text-[#1b4332]"
                        : isSelected
                        ? "bg-stone-50 text-stone-400 cursor-default"
                        : "text-stone-800 hover:bg-stone-50"
                    }`}
                  >
                    <span className={isSelected ? "line-through text-stone-400" : ""}>
                      {formatSymptomLabel(symptom)}
                    </span>
                    {isSelected ? (
                      <span className="text-[11px] font-medium text-stone-400">Added</span>
                    ) : (
                      <span className="text-[11px] text-stone-400">+ Add</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Category Filter & Quick Browsing */}
      <div className="rounded-lg border border-stone-200 bg-stone-50/60 p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            Browse by Clinical Category
          </span>
          <span className="text-[11px] text-stone-400 hidden sm:inline">
            Click to add or remove
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 pb-2.5 border-b border-stone-200/60 mb-2.5">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeCategory === key
                  ? "bg-[#1b4332] text-white shadow-2xs"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Symptoms in Active Category */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES[activeCategory]?.symptoms.map((symptom) => {
            const isSelected = selected.includes(symptom);
            return (
              <button
                key={symptom}
                type="button"
                onClick={() => handleToggle(symptom)}
                disabled={!isSelected && isAtMax}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-[#1b4332] text-white shadow-2xs hover:bg-[#143225]"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                } ${!isSelected && isAtMax ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span>{formatSymptomLabel(symptom)}</span>
                {isSelected ? (
                  <svg className="h-3 w-3" width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-stone-400 font-normal">+</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Test Scenarios */}
      <div className="pt-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
          Example Presentations (Click to load)
        </span>
        <div className="flex flex-wrap gap-1.5">
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
              className="inline-flex items-center rounded-md border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 hover:border-[#1b4332]/40 hover:bg-[#eef3ef] hover:text-[#1b4332] transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Symptoms Tray */}
      <div className="space-y-2 pt-2 border-t border-stone-200/70">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
            Selected symptoms{" "}
            <span className="ml-1 rounded-full bg-[#eef3ef] text-[#1b4332] px-2 py-0.5 text-xs font-bold border border-[#d2dfd4]">
              {selected.length}
            </span>
          </span>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-stone-500 underline hover:text-red-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {selected.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50/50 p-4 text-center">
            <p className="text-xs text-stone-500">
              No symptoms selected yet. Use the search above or select from the clinical categories.
            </p>
          </div>
        ) : (
          <div
            role="list"
            aria-label="Selected symptoms"
            className="flex flex-wrap gap-1.5"
          >
            {selected.map((symptom) => (
              <div
                key={symptom}
                role="listitem"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#c8d8cb] bg-[#eef3ef] px-2.5 py-1 text-xs font-medium text-[#1b4332]"
              >
                <span>{formatSymptomLabel(symptom)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${formatSymptomLabel(symptom)}`}
                  onClick={() => onRemove(symptom)}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded text-[#1b4332]/70 hover:bg-[#d8e7dc] hover:text-[#1b4332] focus:outline-none focus:ring-1 focus:ring-[#1b4332]"
                >
                  <svg
                    className="h-3 w-3"
                    width={12}
                    height={12}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
