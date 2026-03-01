"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

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
        prompt_pdf_path: promptPdfPath || null,
        rubric_pdf_path: rubricPdfPath || null,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in to upload.");
        return;
      }
      const ext = file.name.endsWith(".pdf") ? "" : ".pdf";
      const path = `${user.id}/${target}-${crypto.randomUUID()}${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("assignment-pdfs")
        .upload(path, file, { contentType: "application/pdf", upsert: true });
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      if (target === "prompt") {
        setPromptPdfPath(path);
        setPromptText("");
      } else {
        setRubricPdfPath(path);
        setRubricText("");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload PDF."
      );
    } finally {
      setPdfLoading(null);
    }
  }

  function clearPdf(target: "prompt" | "rubric") {
    if (target === "prompt") setPromptPdfPath(null);
    else setRubricPdfPath(null);
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
              {pdfLoading === "prompt" ? "Uploading..." : "Upload PDF"}
            </Button>
          </div>
          )}
        </div>
        {promptPdfPath && !isEdit && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            PDF uploaded. The LLM will read it directly.{" "}
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
          disabled={!!promptPdfPath && !isEdit}
          rows={6}
          placeholder="Paste the assignment prompt or upload a PDF (LLM will read the PDF directly)..."
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
              {pdfLoading === "rubric" ? "Uploading..." : "Upload PDF"}
            </Button>
          </div>
          )}
        </div>
        {rubricPdfPath && !isEdit && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            PDF uploaded. The LLM will read it directly.{" "}
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
          disabled={!!rubricPdfPath && !isEdit}
          rows={8}
          placeholder="Paste the rubric or upload a PDF (LLM will read the PDF directly). Include categories, point values, and requirements..."
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
