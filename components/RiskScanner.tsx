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
  high: "bg-destructive-muted text-destructive",
  medium: "bg-warning-muted text-warning",
  low: "bg-muted text-muted-foreground",
};

export function RiskScanner({ risks }: RiskScannerProps) {
  if (risks.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Risk scanner
        </h2>
        <div className="mt-4 rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            No major risks identified. You&apos;re on track!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">
        Risk scanner
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Potential deduction triggers to address
      </p>
      <div className="mt-4 space-y-3">
        {risks.map((risk, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
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
              <p className="text-foreground">
                {risk.description}
              </p>
              {risk.suggestion && (
                <p className="mt-1 text-sm text-muted-foreground">
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
