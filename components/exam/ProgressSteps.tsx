"use client";

const STEPS = [
  { id: "details", label: "Details" },
  { id: "analyze", label: "Analyze" },
  { id: "schedule", label: "Schedule" },
  { id: "calendar", label: "Calendar" },
] as const;

export function ProgressSteps() {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <li key={step.id} className="flex items-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground transition-colors">
              {i + 1}
            </span>
            <span className="ml-2 text-sm font-medium text-foreground">
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-3 h-px w-6 bg-border" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
