interface ScoreBarProps {
  score: number;
  rank: number;
  label?: string;
  compact?: boolean;
}

export function ScoreBar({
  score,
  rank,
  label = "Model vote fraction",
  compact = false,
}: ScoreBarProps) {
  const pct = Math.round(score * 100);

  // Restrained healthcare palette: primary forest-green for leading rank, muted sage/slate for secondary
  const barColor =
    rank === 1
      ? "bg-[#1b4332]"
      : rank === 2
      ? "bg-emerald-800/80"
      : "bg-stone-500";

  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <div className="flex items-center justify-between text-xs text-stone-600">
        <span className="font-medium text-stone-500">{label}</span>
        <span className="font-semibold text-stone-900 tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 border border-stone-200/50">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${Math.max(pct, 2)}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Model score: ${pct}%`}
        />
      </div>
    </div>
  );
}
