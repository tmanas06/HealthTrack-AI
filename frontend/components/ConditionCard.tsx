import { CandidateCondition } from "@/types/api";
import { ScoreBar } from "./ScoreBar";

interface ConditionCardProps {
  candidate: CandidateCondition;
  isLeading?: boolean;
}

const URGENCY_KEYWORDS = [
  "paralysis",
  "brain hemorrhage",
  "heart attack",
  "aids",
  "coma",
  "tuberculosis",
  "pneumonia",
];

function formatSymptomLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ConditionCard({ candidate, isLeading }: ConditionCardProps) {
  const { rank, condition, score, description, precautions, matching_symptoms = [] } = candidate;
  const isPrimary = isLeading ?? rank === 1;
  const isUrgent = URGENCY_KEYWORDS.some((kw) => condition.toLowerCase().includes(kw));

  return (
    <article
      className={`rounded-xl border bg-white transition-all duration-150 ${
        isUrgent
          ? "border-red-300 ring-1 ring-red-200/50 shadow-xs"
          : isPrimary
          ? "border-emerald-800/30 ring-1 ring-emerald-800/10 shadow-xs"
          : "border-stone-200/90 hover:border-stone-300"
      } ${isPrimary ? "p-4 sm:p-5" : "p-4 sm:p-5"}`}
    >
      {/* Header with Rank & Condition Title */}
      <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-2.5 sm:pb-3">
        <div className="flex items-start gap-2.5">
          <span
            className={`inline-flex items-center justify-center rounded-md text-xs font-semibold px-2 py-1 ${
              isPrimary
                ? "bg-[#1b4332] text-white"
                : "bg-stone-100 text-stone-700 border border-stone-200/70"
            }`}
          >
            #{rank}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`font-semibold text-stone-900 tracking-tight ${
                  isPrimary ? "text-lg sm:text-xl" : "text-base"
                }`}
              >
                {condition}
              </h3>
            </div>
            {isPrimary && (
              <p className="text-[11px] font-medium text-emerald-800 mt-0.5">
                Primary Observation · Non-diagnostic evaluation
              </p>
            )}
          </div>
        </div>

        {isUrgent && (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-semibold text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
            Seek care
          </span>
        )}
      </div>

      {/* Model Score Bar */}
      <div className="mt-2.5 sm:mt-3">
        <ScoreBar score={score} rank={rank} label="Model vote fraction" compact={!isPrimary} />
      </div>

      {/* Matched Symptoms Section */}
      {matching_symptoms.length > 0 && (
        <div className="mt-2.5 pt-2 sm:pt-2.5 border-t border-stone-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1">
            Matched Symptoms
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matching_symptoms.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-md bg-[#eef3ef] px-2 py-0.5 text-xs font-medium text-[#1b4332] border border-[#d2dfd4]"
              >
                {formatSymptomLabel(s)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Description */}
      {description && (
        <div className="mt-2.5 pt-2 sm:pt-2.5 border-t border-stone-100">
          <p
            className={`text-stone-600 leading-relaxed ${
              isPrimary ? "text-xs sm:text-sm" : "text-xs line-clamp-3"
            }`}
          >
            {description}
          </p>
        </div>
      )}

      {/* Recommended Precautions */}
      {precautions.length > 0 && (
        <div className="mt-2.5 pt-2 sm:pt-2.5 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              General Precautions
            </h4>
            <span className="text-[10px] text-stone-600">
              Dataset reference guidance · Not clinical prescriptions
            </span>
          </div>
          <ul className="space-y-1.5">
            {precautions.slice(0, isPrimary ? 4 : 3).map((prec, i) => {
              const isUrgentAction =
                prec.toLowerCase().includes("ambulance") ||
                prec.toLowerCase().includes("emergency");

              return (
                <li
                  key={i}
                  className={`flex items-start gap-2 text-xs leading-normal ${
                    isUrgentAction ? "text-red-700 font-medium" : "text-stone-600"
                  }`}
                >
                  <svg
                    className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${
                      isUrgentAction ? "text-red-600" : "text-stone-400"
                    }`}
                    width={14}
                    height={14}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {isUrgentAction ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    )}
                  </svg>
                  <span>{prec}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}
