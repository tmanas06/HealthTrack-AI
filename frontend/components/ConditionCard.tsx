import { CandidateCondition } from "@/types/api";
import { ScoreBar } from "./ScoreBar";

interface ConditionCardProps {
  candidate: CandidateCondition;
}

const RANK_BADGE_STYLES = [
  "bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-teal-200 ring-2 ring-teal-100",
  "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200 ring-2 ring-blue-100",
  "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-200 ring-2 ring-violet-100",
  "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-200 ring-2 ring-amber-100",
  "bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-slate-200 ring-2 ring-slate-100",
];

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

export function ConditionCard({ candidate }: ConditionCardProps) {
  const { rank, condition, score, description, precautions, matching_symptoms = [] } = candidate;
  const badgeStyle = RANK_BADGE_STYLES[Math.min(rank - 1, RANK_BADGE_STYLES.length - 1)];
  const isUrgent = URGENCY_KEYWORDS.some((kw) => condition.toLowerCase().includes(kw));

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
        isUrgent
          ? "border-rose-300 ring-1 ring-rose-200/50 shadow-rose-100"
          : rank === 1
          ? "border-teal-300 ring-1 ring-teal-200/60 shadow-teal-100"
          : "border-slate-200/90 hover:border-teal-200"
      }`}
    >
      {/* Top Banner & Rank Indicator */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold shadow-sm ${badgeStyle}`}
            >
              #{rank}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-snug group-hover:text-teal-700 transition-colors">
                {condition}
              </h3>
              {rank === 1 && (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600">
                  Primary Match
                </span>
              )}
            </div>
          </div>

          {isUrgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 shadow-xs animate-pulse">
              Seek care
            </span>
          )}
        </div>

        {/* Score Progress Bar */}
        <div className="mt-4">
          <ScoreBar score={score} rank={rank} />
        </div>

        {/* Matching Symptoms Chips */}
        {matching_symptoms.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Matched Symptoms
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {matching_symptoms.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 border border-teal-100"
                >
                  {formatSymptomLabel(s)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Condition Clinical Description */}
        {description && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          </div>
        )}
      </div>

      {/* Recommended Precautions List */}
      {precautions.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-3.5">
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Recommended Precautions
          </h4>
          <ul className="space-y-1.5">
            {precautions.slice(0, 4).map((prec, i) => {
              const isWarning =
                prec.toLowerCase().includes("emergency") ||
                prec.toLowerCase().includes("call") ||
                prec.toLowerCase().includes("doctor") ||
                prec.toLowerCase().includes("hospital");
              return (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-600 leading-normal"
                >
                  <svg
                    className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${
                      isWarning ? "text-rose-500" : "text-teal-500"
                    }`}
                    width={14}
                    height={14}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className={isWarning ? "font-semibold text-rose-800" : ""}>
                    {prec}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}
