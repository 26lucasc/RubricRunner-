"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AssignmentFormProps = {
  assignmentId?: string;
  initialTitle?: string;
  initialPromptText?: string;
  initialRubricText?: string;
  initialDueAt?: string;
};

export function AssignmentForm({
  assignmentId,
  initialTitle = "",
  initialPromptText = "",
  initialRubricText = "",
  initialDueAt = "",
}: AssignmentFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [promptText, setPromptText] = useState(initialPromptText);
  const [rubricText, setRubricText] = useState(initialRubricText);
  const [dueAt, setDueAt] = useState(initialDueAt);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!assignmentId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in to create an assignment.");
      setLoading(false);
      return;
    }

    if (isEdit) {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          prompt_text: promptText.trim(),
          rubric_text: rubricText.trim(),
          due_at: new Date(dueAt).toISOString(),
        }),
      });
      setLoading(false);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to update");
        return;
      }
      router.push(`/assignments/${assignmentId}`);
      router.refresh();
      return;
    }

    const { data, error: insertError } = await supabase
      .from("assignments")
      .insert({
        user_id: user.id,
        title: title.trim(),
        prompt_text: promptText.trim(),
        rubric_text: rubricText.trim(),
        due_at: new Date(dueAt).toISOString(),
      })
      .select("id")
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data?.id) {
      router.push(`/assignments/${data.id}`);
      router.refresh();
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = isEdit ? undefined : tomorrow.toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Assignment title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., AP Lang Rhetorical Analysis Essay"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Assignment prompt
        </label>
        <textarea
          id="prompt"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
          rows={6}
          placeholder="Paste the full assignment prompt here..."
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="rubric"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Rubric
        </label>
        <textarea
          id="rubric"
          value={rubricText}
          onChange={(e) => setRubricText(e.target.value)}
          required
          rows={8}
          placeholder="Paste the full rubric here. Include categories, point values, and requirements..."
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="dueAt"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Due date
        </label>
        <input
          id="dueAt"
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          required
          min={minDate ?? undefined}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading
          ? isEdit
            ? "Saving..."
            : "Creating..."
          : isEdit
            ? "Save changes"
            : "Create and generate plan"}
      </button>
    </form>
  );
}
