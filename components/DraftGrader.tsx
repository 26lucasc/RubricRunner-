"use client";

import { useState } from "react";

interface ScoreBreakdown {
  category: string;
  pointsPossible: number;
  pointsEarned: number;
  feedback: string;
}

interface GradeResult {
  totalPossible: number;
  totalEarned: number;
  percentage: number;
  breakdown: ScoreBreakdown[];
  overallFeedback: string;
  suggestions: string[];
}

interface DraftGraderProps {
  assignmentId: string;
}

export function DraftGrader({ assignmentId }: DraftGraderProps) {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Grading failed");
        setLoading(false);
        return;
      }

      setResult(data as GradeResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setLoading(false);
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Draft pre-grader
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Paste your draft to get a predicted score and feedback
      </p>

      <form onSubmit={handleGrade} className="mt-4 space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your draft here..."
          rows={10}
          className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          disabled={loading}
        />
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Grading..." : "Grade draft"}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {result.totalEarned}/{result.totalPossible}
            </div>
            <div className="text-lg text-slate-600 dark:text-slate-400">
              {result.percentage.toFixed(0)}%
            </div>
          </div>

          <p className="text-slate-700 dark:text-slate-300">
            {result.overallFeedback}
          </p>

          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">
              Score breakdown
            </h3>
            <ul className="mt-2 space-y-2">
              {result.breakdown.map((b, i) => (
                <li
                  key={i}
                  className="rounded border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{b.category}</span>
                    <span>
                      {b.pointsEarned}/{b.pointsPossible}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {b.feedback}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {result.suggestions.length > 0 && (
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">
                Suggestions
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-700 dark:text-slate-300">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
