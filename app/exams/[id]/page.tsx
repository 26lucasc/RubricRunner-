import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ExamStudyPlanDisplay } from "@/components/ExamStudyPlanDisplay";
import { CramPlanDisplay } from "@/components/CramPlanDisplay";
import { ExamResults } from "@/components/ExamResults";
import { DeleteExamButton } from "@/components/DeleteExamButton";
import { RegenerateExamPlanButton } from "@/components/RegenerateExamPlanButton";
import type {
  ExamStudyPlanOutput,
  CramROITopic,
  CramDayBlock,
  CramSheetSection,
} from "@/lib/llm/exam-types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ExamPage({
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
    .select("id, title, exam_date, daily_hours")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!exam) {
    notFound();
  }

  const { data: plan } = await supabase
    .from("exam_study_plans")
    .select("study_mode, topic_analysis, prioritization, time_allocation, sessions, calendar, insights, cram_sheet_json")
    .eq("exam_id", id)
    .single();

  const studyMode = (plan?.study_mode as string) ?? "balanced";
  const output = plan as unknown as ExamStudyPlanOutput | null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            {exam.title}
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/exams/${id}/edit`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Edit
            </Link>
            <DeleteExamButton examId={id} examTitle={exam.title} />
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-4">
          <p className="text-muted-foreground">
            Exam: {formatDate(exam.exam_date)} · {exam.daily_hours} hrs/day available
          </p>
          {output && <RegenerateExamPlanButton examId={id} />}
          {studyMode === "cram" && (
            <span className="rounded-full bg-cram-muted px-3 py-1 text-xs font-medium text-cram">
              Cram mode
            </span>
          )}
        </div>

        {output ? (
          <div className="mt-8">
            {studyMode === "cram" ? (
              <CramPlanDisplay
                roiTopics={(plan?.prioritization ?? []) as CramROITopic[]}
                dailySchedule={(plan?.calendar ?? []) as CramDayBlock[]}
                cramSheet={(plan?.cram_sheet_json ?? { formulasAndDefs: [], commonTraps: [], exampleProblems: [], topMistakes: [] }) as CramSheetSection}
                insights={output.insights ?? { topScoreRisks: [], topROIActions: [], predictedPreparednessLevel: "Unknown" }}
              />
            ) : (
              <ExamStudyPlanDisplay
                topicAnalysis={output.topicAnalysis ?? []}
                prioritization={output.prioritization ?? []}
                timeAllocation={output.timeAllocation ?? { hoursPerTopic: [], totalHours: 0, bufferBeforeExam: 1 }}
                sessions={output.sessions ?? []}
                calendar={output.calendar ?? []}
                insights={output.insights ?? { topScoreRisks: [], topROIActions: [], predictedPreparednessLevel: "Unknown" }}
              />
            )}
          </div>
        ) : (
          <ExamResults examId={id} />
        )}
      </main>
    </div>
  );
}
