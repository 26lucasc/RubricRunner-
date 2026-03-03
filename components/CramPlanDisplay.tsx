"use client";

import type {
  CramROITopic,
  CramDayBlock,
  CramSheetSection,
  StrategicInsights,
} from "@/lib/llm/exam-types";

interface CramPlanDisplayProps {
  roiTopics: CramROITopic[];
  dailySchedule: CramDayBlock[];
  cramSheet: CramSheetSection;
  insights: StrategicInsights;
}

export function CramPlanDisplay({
  roiTopics,
  dailySchedule,
  cramSheet,
  insights,
}: CramPlanDisplayProps) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Score ROI — Top topics
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Highest-weight, highest-yield topics with recommended action type
        </p>
        <div className="mt-4 rounded-lg border border-border bg-card  overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted ">
                <th className="px-4 py-3 text-left font-medium text-foreground">Topic</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Weight</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Confidence</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">ROI</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {roiTopics.map((t, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-3 text-foreground">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      t.weight === "High" ? "bg-cram-muted text-cram" :
                      t.weight === "Medium" ? "bg-balanced-muted text-balanced" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {t.weight}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.confidence ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">
                    {t.roiScore}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {t.recommendedAction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Daily schedule — Blocks
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Short, specific sessions with timer and deliverable
        </p>
        <div className="mt-4 space-y-6">
          {dailySchedule.map((day, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 "
            >
              <h3 className="font-medium text-foreground">
                {formatDate(day.date)}
              </h3>
              <div className="mt-3 space-y-3">
                {Array.isArray(day.blocks) &&
                  day.blocks.map((b, j) => (
                    <div
                      key={j}
                      className="rounded border border-border bg-muted/50 p-4 "
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {b.topic}
                        </span>
                        <span className="rounded bg-cram-muted px-2 py-0.5 text-xs font-medium text-cram">
                          {b.durationMinutes} min
                          {b.timerFormat ? ` · ${b.timerFormat}` : ""}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-foreground">
                        <strong>Task:</strong> {b.task}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <strong>Deliverable:</strong> {b.deliverable}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Cram sheet builder
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Compile as you complete sessions — your 1-page cheat sheet
        </p>
        <div className="mt-4 rounded-lg border border-border bg-card p-6 ">
          <div className="space-y-6">
            {cramSheet.formulasAndDefs?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  Formulas / definitions
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  {cramSheet.formulasAndDefs.map((item, k) => (
                    <li key={k}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {cramSheet.commonTraps?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  Common traps
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  {cramSheet.commonTraps.map((item, k) => (
                    <li key={k}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {cramSheet.exampleProblems?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  Example problems
                </h4>
                <ul className="mt-2 space-y-2 text-sm text-foreground">
                  {cramSheet.exampleProblems.map((item, k) => (
                    <li key={k} className="rounded bg-slate-50 p-2 dark:bg-slate-800">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cramSheet.topMistakes?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Top mistakes to avoid
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  {cramSheet.topMistakes.map((item, k) => (
                    <li key={k}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Strategic insights
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-destructive/30 bg-destructive-muted p-4 dark:border-red-800 dark:bg-red-900/10">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
              Top score risks
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-destructive">
              {insights.topScoreRisks?.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-success bg-success-muted p-4 ">
            <h3 className="text-sm font-medium text-success">
              Highest ROI actions
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-success">
              {insights.topROIActions?.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 ">
          <h3 className="text-sm font-medium text-primary">
            Predicted preparedness
          </h3>
          <p className="mt-1 text-foreground">
            {insights.predictedPreparednessLevel}
          </p>
        </div>
      </section>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
