"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function isoToLocalDatetime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

type AssignmentFormProps = {
  assignmentId?: string;
  initialTitle?: string;
  initialPromptText?: string;
  initialRubricText?: string;
  /** For create: local datetime string. For edit: pass initialDueAtIso instead. */
  initialDueAt?: string;
  /** For edit: raw ISO from DB; converted to user's local time in browser */
  initialDueAtIso?: string;
};

export function AssignmentForm({
  assignmentId,
  initialTitle = "",
  initialPromptText = "",
  initialRubricText = "",
  initialDueAt = "",
  initialDueAtIso,
}: AssignmentFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [promptText, setPromptText] = useState(initialPromptText);
  const [rubricText, setRubricText] = useState(initialRubricText);
  const [dueAt, setDueAt] = useState(() =>
    initialDueAtIso ? isoToLocalDatetime(initialDueAtIso) : initialDueAt
  );

  useEffect(() => {
    if (initialDueAtIso) {
      setDueAt(isoToLocalDatetime(initialDueAtIso));
    }
  }, [initialDueAtIso]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [promptPdfPath, setPromptPdfPath] = useState<string | null>(null);
  const [rubricPdfPath, setRubricPdfPath] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<"prompt" | "rubric" | null>(null);
  const promptPdfRef = useRef<HTMLInputElement>(null);
  const rubricPdfRef = useRef<HTMLInputElement>(null);
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
      try {
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
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err.message : "Failed to update");
      }
      return;
    }

    const hasPrompt = promptText.trim() || promptPdfPath;
    const hasRubric = rubricText.trim() || rubricPdfPath;
    if (!hasPrompt || !hasRubric) {
      setError("Please provide assignment prompt and rubric (paste text or upload PDF).");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("assignments")
      .insert({
        user_id: user.id,
        title: title.trim(),
        prompt_text: promptText.trim() || null,
        rubric_text: rubricText.trim() || null,
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
  tomorrow.setHours(0, 0, 0, 0);
  const minDate = isEdit
    ? undefined
    : `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}T00:00`;

  async function handlePdfUpload(
    file: File,
    target: "prompt" | "rubric"
  ) {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setPdfLoading(target);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", target);

      const res = await fetch("/api/pdf/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to extract text from PDF");
      }

      const extractedText = data.text ?? "";
      if (target === "prompt") {
        setPromptPdfPath(file.name);
        setPromptText(extractedText);
      } else {
        setRubricPdfPath(file.name);
        setRubricText(extractedText);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to extract text from PDF."
      );
    } finally {
      setPdfLoading(null);
    }
  }

  function clearPdf(target: "prompt" | "rubric") {
    if (target === "prompt") {
      setPromptPdfPath(null);
      setPromptText("");
    } else {
      setRubricPdfPath(null);
      setRubricText("");
    }
  }

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
        <div className="flex items-center justify-between">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Assignment prompt
          </label>
          {!isEdit && (
          <div>
            <input
              ref={promptPdfRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePdfUpload(file, "prompt");
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => promptPdfRef.current?.click()}
              disabled={pdfLoading !== null}
            >
              {pdfLoading === "prompt" ? "Uploading and extracting..." : "Upload PDF"}
            </Button>
          </div>
          )}
        </div>
        {promptPdfPath && !isEdit && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            PDF uploaded and text extracted.{" "}
            <button
              type="button"
              onClick={() => clearPdf("prompt")}
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Remove
            </button>
          </p>
        )}
        <textarea
          id="prompt"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required={isEdit}
          rows={6}
          placeholder="Paste the assignment prompt or upload a PDF to extract text..."
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="rubric"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Rubric
          </label>
          {!isEdit && (
          <div>
            <input
              ref={rubricPdfRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePdfUpload(file, "rubric");
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => rubricPdfRef.current?.click()}
              disabled={pdfLoading !== null}
            >
              {pdfLoading === "rubric" ? "Uploading and extracting..." : "Upload PDF"}
            </Button>
          </div>
          )}
        </div>
        {rubricPdfPath && !isEdit && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            PDF uploaded and text extracted.{" "}
            <button
              type="button"
              onClick={() => clearPdf("rubric")}
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Remove
            </button>
          </p>
        )}
        <textarea
          id="rubric"
          value={rubricText}
          onChange={(e) => setRubricText(e.target.value)}
          required={isEdit}
          rows={8}
          placeholder="Paste the rubric or upload a PDF to extract text. Include categories, point values, and requirements..."
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
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
