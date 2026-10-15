export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-50/90 p-5 shadow-sm text-sm text-amber-900 ${className}`}
      role="note"
      aria-label="Medical disclaimer"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-xs">
          <svg
            className="h-5 w-5"
            width={20}
            height={20}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-amber-950">
            Educational Prototype Only — Not for Clinical Use
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed text-amber-800">
            This tool is an educational machine learning demonstration and does not provide
            medical advice, diagnosis, or treatment. Results are generated from a synthetic dataset
            and have not been clinically validated. Always consult a qualified healthcare professional
            for health concerns. In an emergency, call your local emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
