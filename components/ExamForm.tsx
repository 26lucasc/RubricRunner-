"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProgressSteps } from "@/components/exam/ProgressSteps";
import { StudyModeCard } from "@/components/exam/StudyModeCard";
import { PlanPreview } from "@/components/exam/PlanPreview";
import { MaterialsDropzone } from "@/components/exam/MaterialsDropzone";
import { Sparkles } from "lucide-react";
import type { CramSettings } from "@/lib/llm/exam-types";

type StudyMode = "balanced" | "cram";

type ExamFormProps = {
  examId?: string;
  initialTitle?: string;
  initialExamDate?: string;
  initialDailyHours?: number;
  initialMaterialsText?: string;
  initialStudyMode?: StudyMode;
  initialCramSettings?: Partial<CramSettings>;
};

const defaultCramSettings: CramSettings = {
  intensity: "Normal",
  sessionLength: 25,
  breakMinutesPer25: 5,
  includeTimedSimulation: true,
  protectSleep: true,
  sleepCutoffTime: "22:30",
};

export function ExamForm({
  examId,
  initialTitle = "",
  initialExamDate = "",
  initialDailyHours = 3,
  initialMaterialsText = "",
  initialStudyMode = "balanced",
  initialCramSettings,
}: ExamFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [examDate, setExamDate] = useState(initialExamDate);
  const [dailyHours, setDailyHours] = useState(String(initialDailyHours));
  const [studyMode, setStudyMode] = useState<StudyMode>(initialStudyMode);
  const [cramSettings, setCramSettings] = useState<CramSettings>({
    ...defaultCramSettings,
    ...initialCramSettings,
  });
  const [materialsText, setMaterialsText] = useState(initialMaterialsText);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isEdit = !!examId;

  const today = new Date().toISOString().slice(0, 10);
  const examDateObj = examDate ? new Date(examDate) : null;
  const daysLeft =
    examDateObj && examDateObj.getTime() > Date.now()
      ? Math.ceil((examDateObj.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : null;
  const hoursNum = Math.max(0.5, Math.min(24, parseFloat(dailyHours) || 3));
  const totalHours = daysLeft !== null && daysLeft > 0 ? Math.round(daysLeft * hoursNum - 2) : null;
  const recommendedMode =
    daysLeft !== null && daysLeft <= 4 && daysLeft > 0 ? "cram" : null;
  const showCramSuggestion = recommendedMode === "cram" && studyMode === "balanced";
  const hasMaterials = materialsText.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const hours = Math.max(0.5, Math.min(24, parseFloat(dailyHours) || 3));

    if (isEdit) {
      try {
        const res = await fetch(`/api/exams/${examId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            exam_date: examDate,
            daily_hours: hours,
            materials_text: materialsText.trim() || null,
            study_mode: studyMode,
            cram_settings_json: studyMode === "cram" ? cramSettings : null,
          }),
        });
        setLoading(false);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Failed to update");
          return;
        }
        router.push(`/exams/${examId}`);
        router.refresh();
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err.message : "Failed to update");
      }
      return;
    }

    if (!title.trim()) {
      setError("Please enter an exam title.");
      setLoading(false);
      return;
    }
    if (!examDate) {
      setError("Please select the exam date.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          exam_date: examDate,
          daily_hours: hours,
          materials_text: materialsText.trim() || null,
          study_mode: studyMode,
          cram_settings_json: studyMode === "cram" ? cramSettings : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? "Failed to create exam");
        return;
      }

      if (data.id) {
        router.push(`/exams/${data.id}`);
        router.refresh();
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to create exam");
    }
  }

  async function handlePdfUpload(file: File) {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "prompt");

      const res = await fetch("/api/pdf/extract", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error ?? "Failed to extract text from PDF");

      setMaterialsText(data.text ?? "");
      setPdfPath(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract text from PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  function handlePdfRemove() {
    setPdfPath(null);
    setMaterialsText("");
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <ProgressSteps />

      <div className="lg:grid lg:grid-cols-[1fr,340px] lg:gap-10">
        {/* Main form column */}
        <div className="space-y-8">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Details card */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">
              Exam details
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-foreground"
                >
                  Exam title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., AP Calculus BC Midterm"
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="examDate"
                  className="block text-sm font-medium text-foreground"
                >
                  Exam date
                </label>
                <input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  min={today}
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-5">
              <label
                htmlFor="dailyHours"
                className="block text-sm font-medium text-foreground"
              >
                Daily study hours available
              </label>
              <input
                id="dailyHours"
                type="number"
                min={0.5}
                max={24}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                placeholder="3"
                className="mt-1.5 w-28 rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </section>

          {/* Study mode card */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">
              Study mode
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <StudyModeCard
                mode="balanced"
                label="Balanced"
                description="Steady pacing, spaced review, sustainable"
                selected={studyMode === "balanced"}
                recommended={recommendedMode === null}
                onSelect={() => setStudyMode("balanced")}
              />
              <StudyModeCard
                mode="cram"
                label="Cram mode"
                description="High-intensity, short sessions, last-minute focus"
                selected={studyMode === "cram"}
                recommended={recommendedMode === "cram"}
                onSelect={() => setStudyMode("cram")}
              />
            </div>
            {showCramSuggestion && (
              <button
                type="button"
                onClick={() => setStudyMode("cram")}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-cram-muted px-4 py-2 text-sm font-medium text-cram transition-colors hover:bg-cram-muted/80"
              >
                Exam is soon — switch to Cram Mode?
              </button>
            )}
          </section>

          {studyMode === "cram" && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">
                Cram settings
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Intensity
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    {(["Normal", "Aggressive", "Insane"] as const).map((v) => (
                      <label key={v} className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="radio"
                          name="intensity"
                          checked={cramSettings.intensity === v}
                          onChange={() =>
                            setCramSettings((s) => ({ ...s, intensity: v }))
                          }
                          className="h-3.5 w-3 border-input text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          {v}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Session length
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    {([25, 45, 60] as const).map((v) => (
                      <label key={v} className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="radio"
                          name="sessionLength"
                          checked={cramSettings.sessionLength === v}
                          onChange={() =>
                            setCramSettings((s) => ({ ...s, sessionLength: v }))
                          }
                          className="h-3.5 w-3 border-input text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          {v} min
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="breakRule"
                    className="block text-xs font-medium text-muted-foreground"
                  >
                    Break (min per 25)
                  </label>
                  <input
                    id="breakRule"
                    type="number"
                    min={0}
                    max={15}
                    value={cramSettings.breakMinutesPer25}
                    onChange={(e) =>
                      setCramSettings((s) => ({
                        ...s,
                        breakMinutesPer25: Math.max(
                          0,
                          Math.min(15, parseInt(e.target.value, 10) || 0)
                        ),
                      }))
                    }
                    className="mt-1.5 w-20 rounded border border-input px-2 py-1.5 text-sm bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cramSettings.includeTimedSimulation}
                    onChange={(e) =>
                      setCramSettings((s) => ({
                        ...s,
                        includeTimedSimulation: e.target.checked,
                      }))
                    }
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">
                    Timed simulation
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cramSettings.protectSleep}
                    onChange={(e) =>
                      setCramSettings((s) => ({ ...s, protectSleep: e.target.checked }))
                    }
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">
                    Protect sleep
                  </span>
                </label>
              </div>
            </section>
          )}

          {/* Materials */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">
              Exam materials
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload PDF, paste a link, or paste content
            </p>
            <div className="mt-5">
              {!isEdit ? (
                <MaterialsDropzone
                  materialsText={materialsText}
                  onMaterialsChange={setMaterialsText}
                  pdfFileName={pdfPath}
                  onPdfUpload={handlePdfUpload}
                  onPdfRemove={handlePdfRemove}
                  pdfLoading={pdfLoading}
                  error={error}
                  onClearError={() => setError(null)}
                  onError={setError}
                />
              ) : (
                <textarea
                  value={materialsText}
                  onChange={(e) => setMaterialsText(e.target.value)}
                  rows={6}
                  placeholder="Paste materials..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              )}
            </div>
          </section>

          {/* Mobile CTA */}
          <div className="lg:hidden">
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 py-6 text-base font-semibold"
            >
              <Sparkles className="size-5" />
              {loading
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save changes"
                  : "Generate study plan"}
            </Button>
          </div>
        </div>

        {/* Preview sidebar + sticky CTA (desktop) */}
        <div className="mt-10 flex flex-col gap-6 lg:mt-0">
          <PlanPreview
            title={title}
            examDate={examDate}
            dailyHours={hoursNum}
            studyMode={studyMode}
            daysLeft={daysLeft}
            totalHours={totalHours}
            recommendedMode={recommendedMode}
            hasMaterials={hasMaterials}
            compact={false}
          />

          <div className="hidden lg:block">
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 py-6 text-base font-semibold shadow-md transition-all hover:shadow-lg"
            >
              <Sparkles className="size-5" />
              {loading
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save changes"
                  : "Generate study plan"}
            </Button>
          </div>
        </div>
      </div>

    </form>
  );
}
