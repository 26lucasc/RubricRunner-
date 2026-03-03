import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { ExamForm } from "@/components/ExamForm";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: exam } = await supabase
    .from("exams")
    .select("id, title, exam_date, daily_hours, materials_text, study_mode, cram_settings_json")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!exam) {
    notFound();
  }

  const examDateIso = typeof exam.exam_date === "string"
    ? exam.exam_date
    : (exam.exam_date as unknown as { toISOString?: () => string })?.toISOString?.() ?? "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/exams/${id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← Back to exam
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Edit exam
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Update details. Re-generate the study plan from the exam page after saving.
        </p>

        <ExamForm
          examId={id}
          initialTitle={exam.title}
          initialExamDate={examDateIso.slice(0, 10)}
          initialDailyHours={Number(exam.daily_hours) || 3}
          initialMaterialsText={exam.materials_text ?? ""}
          initialStudyMode={(exam.study_mode as "balanced" | "cram") ?? "balanced"}
          initialCramSettings={(exam.cram_settings_json ?? undefined) as Partial<import("@/lib/llm/exam-types").CramSettings> | undefined}
        />
      </main>
    </div>
  );
}
