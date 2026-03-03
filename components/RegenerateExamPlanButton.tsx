"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegenerateExamPlanButton({ examId }: { examId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRegenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/exams/${examId}/generate`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Regeneration failed");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        <button
          type="button"
          onClick={() => { setError(null); handleRegenerate(); }}
          className="text-sm font-medium text-primary hover:text-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleRegenerate}
      disabled={loading}
      className="text-sm font-medium text-primary hover:text-primary/90 disabled:opacity-50"
    >
      {loading ? "Regenerating…" : "Regenerate plan"}
    </button>
  );
}
