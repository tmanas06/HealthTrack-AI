interface ScoreBarProps {
  score: number;
  rank: number;
}

const RANK_GRADIENTS = [
  "from-teal-500 to-cyan-500",
  "from-blue-500 to-indigo-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-slate-500 to-slate-600",
];

export function ScoreBar({ score, rank }: ScoreBarProps) {
  const pct = Math.round(score * 100);
  const gradient = RANK_GRADIENTS[Math.min(rank - 1, RANK_GRADIENTS.length - 1)];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">Model Vote Fraction</span>
        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
          {pct}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(pct, 3)}%` }}
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
