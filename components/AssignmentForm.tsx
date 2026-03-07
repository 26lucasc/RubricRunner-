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
  const [promptPdfName, setPromptPdfName] = useState<string | null>(null);
  const [rubricPdfPath, setRubricPdfPath] = useState<string | null>(null);
  const [rubricPdfName, setRubricPdfName] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<"prompt" | "rubric" | null>(null);
  const promptPdfRef = useRef<HTMLInputElement>(null);
  const rubricPdfRef = useRef<HTMLInputElement>(null);
  const tempId = useRef<string>(crypto.randomUUID());
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
  tomorrow.setHours(0, 0, 0, 0);
  const minDate = isEdit
    ? undefined
    : `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}T00:00`;

  async function handlePdfUpload(file: File, target: "prompt" | "rubric") {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setPdfLoading(target);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/${tempId.current}/${target}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("assignment-pdfs")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      if (target === "prompt") {
        setPromptPdfPath(path);
        setPromptPdfName(file.name);
      } else {
        setRubricPdfPath(path);
        setRubricPdfName(file.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload PDF.");
    } finally {
      setPdfLoading(null);
    }
  }

  async function clearPdf(target: "prompt" | "rubric") {
    const path = target === "prompt" ? promptPdfPath : rubricPdfPath;
    if (path) {
      await supabase.storage.from("assignment-pdfs").remove([path]);
    }
    if (target === "prompt") {
      setPromptPdfPath(null);
      setPromptPdfName(null);
    } else {
      setRubricPdfPath(null);
      setRubricPdfName(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive-muted p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-foreground"
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
          className="mt-1 block w-full rounded-lg border border-input px-3 py-2 bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary "
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-foreground"
          >
            Assignment prompt
          </label>
          {!isEdit && !promptPdfPath && (
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
        {promptPdfPath && !isEdit ? (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-950">
            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-700 dark:text-green-300 flex-1 truncate">{promptPdfName}</span>
            <button
              type="button"
              onClick={() => clearPdf("prompt")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Remove
            </button>
          </div>
        ) : (
          <textarea
            id="prompt"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            required={isEdit}
            rows={6}
            placeholder="Paste the assignment prompt or upload a PDF..."
            className="mt-1 block w-full rounded-lg border border-input px-3 py-2 bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="rubric"
            className="block text-sm font-medium text-foreground"
          >
            Rubric
          </label>
          {!isEdit && !rubricPdfPath && (
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
        {rubricPdfPath && !isEdit ? (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-950">
            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-700 dark:text-green-300 flex-1 truncate">{rubricPdfName}</span>
            <button
              type="button"
              onClick={() => clearPdf("rubric")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Remove
            </button>
          </div>
        ) : (
          <textarea
            id="rubric"
            value={rubricText}
            onChange={(e) => setRubricText(e.target.value)}
            required={isEdit}
            rows={8}
            placeholder="Paste the rubric or upload a PDF. Include categories, point values, and requirements..."
            className="mt-1 block w-full rounded-lg border border-input px-3 py-2 bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
        )}
      </div>

      <div>
        <label
          htmlFor="dueAt"
          className="block text-sm font-medium text-foreground"
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
          className="mt-1 block w-full rounded-lg border border-input px-3 py-2 bg-background text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary "
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
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
