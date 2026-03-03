"use client";

import type {
  ExamTopic,
  PrioritizedTopic,
  TimeAllocation,
  SessionDesign,
  CalendarBlock,
  StrategicInsights,
} from "@/lib/llm/exam-types";

interface ExamStudyPlanDisplayProps {
  topicAnalysis: ExamTopic[];
  prioritization: PrioritizedTopic[];
  timeAllocation: {
    hoursPerTopic: TimeAllocation[];
    totalHours: number;
    bufferBeforeExam: number;
    summary?: string;
  };
  sessions: SessionDesign[];
  calendar: CalendarBlock[];
  insights: StrategicInsights;
}

export function ExamStudyPlanDisplay({
  topicAnalysis,
  prioritization,
  timeAllocation,
  sessions,
  calendar,
  insights,
}: ExamStudyPlanDisplayProps) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Step 1 — Topic analysis
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Extracted core topics with weight and difficulty
        </p>
        <div className="mt-4 rounded-lg border border-border bg-white dark:border-slate-700  overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-foreground">Topic</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Weight</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Difficulty</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Cognitive verbs</th>
              </tr>
            </thead>
            <tbody>
              {topicAnalysis.map((t, i) => (
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
                  <td className="px-4 py-3 text-foreground">{t.difficulty}/5</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {Array.isArray(t.cognitiveVerbs) ? t.cognitiveVerbs.join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Step 2 — Prioritization
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked by importance, difficulty, and weakness factor
        </p>
        <div className="mt-4 space-y-3">
          {prioritization.map((p, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-white p-4 dark:border-slate-700 "
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  #{p.rank}
                </span>
                <span className="font-medium text-foreground">{p.name}</span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Score: {p.priorityScore}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Step 3 — Time allocation
        </h2>
        <div className="mt-4 rounded-lg border border-border bg-white p-4 dark:border-slate-700 ">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="font-medium text-foreground">
              Total: {timeAllocation.totalHours} hrs
            </span>
            <span className="text-muted-foreground">
              Buffer before exam: {timeAllocation.bufferBeforeExam} hrs
            </span>
          </div>
          {timeAllocation.summary && (
            <p className="mt-2 text-sm text-muted-foreground">{timeAllocation.summary}</p>
          )}
          <ul className="mt-4 space-y-2">
            {timeAllocation.hoursPerTopic.map((t, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-foreground">{t.topicName}</span>
                <span className="text-muted-foreground">
                  {t.hours} hrs ({t.sessionCount} sessions)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Step 4 — Session design
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Active study sessions with specific objectives
        </p>
        <div className="mt-4 space-y-3">
          {sessions.map((s, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-white p-4 dark:border-slate-700 "
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{s.topic}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {s.durationMinutes} min · {s.method}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground">
                <strong>Objective:</strong> {s.objective}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <strong>Output:</strong> {s.output}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Step 5 — Study calendar
        </h2>
        <div className="mt-4 space-y-6">
          {calendar.map((day, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-white p-4 dark:border-slate-700 "
            >
              <h3 className="font-medium text-foreground">
                {formatDate(day.date)}
              </h3>
              <div className="mt-3 space-y-2">
                {Array.isArray(day.blocks) && day.blocks.map((b, j) => (
                  <div
                    key={j}
                    className="flex items-start gap-3 rounded border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {b.timeBlock}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-foreground">{b.topic}</span>
                      <p className="text-sm text-muted-foreground">{b.task}</p>
                    </div>
                    <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${
                      b.cognitiveLoad === "Heavy" ? "bg-cram-muted text-cram" :
                      b.cognitiveLoad === "Moderate" ? "bg-balanced-muted text-balanced" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {b.cognitiveLoad}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Step 6 — Strategic insights
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-destructive/30 bg-destructive-muted p-4 dark:border-red-800 dark:bg-red-900/10">
            <h3 className="text-sm font-medium text-destructive">Top score risks</h3>
            <ul className="mt-2 space-y-1 text-sm text-destructive">
              {insights.topScoreRisks?.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-success bg-success-muted p-4 dark:border-emerald-800 dark:bg-emerald-900/10">
            <h3 className="text-sm font-medium text-success">Highest ROI actions</h3>
            <ul className="mt-2 space-y-1 text-sm text-success">
              {insights.topROIActions?.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 dark:border-primary/40 dark:bg-primary/10">
          <h3 className="text-sm font-medium text-primary">Predicted preparedness</h3>
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
