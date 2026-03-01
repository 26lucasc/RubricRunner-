interface Risk {
  type: string;
  severity: string;
  description: string;
  suggestion?: string;
}

interface RiskScannerProps {
  risks: Risk[];
}

const severityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

export function RiskScanner({ risks }: RiskScannerProps) {
  if (risks.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Risk scanner
        </h2>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            No major risks identified. You&apos;re on track!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Risk scanner
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Potential deduction triggers to address
      </p>
      <div className="mt-4 space-y-3">
        {risks.map((risk, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                severityColors[risk.severity as keyof typeof severityColors] ??
                severityColors.low
              }`}
            >
              {risk.severity}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-slate-900 dark:text-white">
                {risk.description}
              </p>
              {risk.suggestion && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Suggestion: {risk.suggestion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
