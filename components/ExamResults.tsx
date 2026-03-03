"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ExamResults({ examId }: { examId: string }) {
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      setStatus("generating");
      setError(null);

      try {
        const res = await fetch(`/api/exams/${examId}/generate`, { method: "POST" });

        if (cancelled) return;

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Generation failed");
          setStatus("error");
          return;
        }

        router.refresh();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Network error");
          setStatus("error");
        }
      }
    }

    generate();
    return () => { cancelled = true; };
  }, [examId, router]);

  if (status === "generating") {
    return (
      <div className="mt-12 rounded-lg border border-border bg-card p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Generating your exam study plan...
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Analyzing materials, prioritizing topics, and designing sessions.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-12 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="font-medium text-red-800 dark:text-red-400">Generation failed</p>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return null;
}
