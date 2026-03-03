"use client";

import { cn } from "@/lib/utils";

interface PlanPreviewProps {
  title: string;
  examDate: string;
  dailyHours: number;
  studyMode: "balanced" | "cram";
  daysLeft: number | null;
  totalHours: number | null;
  recommendedMode: "balanced" | "cram" | null;
  hasMaterials: boolean;
  compact?: boolean;
}

export function PlanPreview({
  title,
  examDate,
  dailyHours,
  studyMode,
  daysLeft,
  totalHours,
  recommendedMode,
  hasMaterials,
  compact = false,
}: PlanPreviewProps) {
  const content = (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Plan preview
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Updates as you fill in details
        </p>
      </div>

      <div className="space-y-4">
        {daysLeft !== null && (
          <div>
            <span className="text-xs text-muted-foreground">Days until exam</span>
            <p className="text-lg font-semibold text-foreground">{daysLeft}</p>
          </div>
        )}

        {totalHours !== null && (
          <div>
            <span className="text-xs text-muted-foreground">Total available hours</span>
            <p className="text-lg font-semibold text-foreground">{totalHours} hrs</p>
          </div>
        )}

        {recommendedMode && (
          <div>
            <span className="text-xs text-muted-foreground">Recommended mode</span>
            <p className="text-sm font-medium text-foreground">
              {recommendedMode === "cram" ? "Cram mode" : "Balanced"}
              {recommendedMode === "cram" && " (exam soon)"}
            </p>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">What you&apos;ll get</span>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li>• Prioritized topic list</li>
            <li>• Day-by-day schedule</li>
            <li>• Active study sessions</li>
            {studyMode === "cram" && <li>• 1-page cram sheet</li>}
            <li>• Strategic insights</li>
          </ul>
        </div>

        {!hasMaterials && (title || examDate) && (
          <p className="rounded-lg bg-warning-muted px-3 py-2 text-xs text-warning">
            Add materials for better analysis
          </p>
        )}
      </div>
    </div>
  );

  const wrapperClass = compact
    ? "rounded-xl border border-border bg-card p-4 shadow-sm"
    : cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        "lg:sticky lg:top-6 lg:self-start"
      );

  return <aside className={wrapperClass}>{content}</aside>;
}
