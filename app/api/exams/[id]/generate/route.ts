import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateExamStudyPlan } from "@/lib/llm/exam-strategist";
import type { CramStudyPlanOutput, ExamStudyPlanOutput } from "@/lib/llm/exam-types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: exam, error: fetchError } = await supabase
    .from("exams")
    .select("id, title, exam_date, daily_hours, materials_text, confidence_json, study_mode, cram_settings_json")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !exam) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const studyMode = exam.study_mode === "cram" ? "cram" : "balanced";
    const cramSettings = (exam.cram_settings_json as Record<string, unknown> | null) ?? undefined;

    const plan = await generateExamStudyPlan({
      examTitle: exam.title,
      examDate: new Date(exam.exam_date),
      dailyHours: Number(exam.daily_hours) || 3,
      materialsText: exam.materials_text ?? "",
      confidenceJson: (exam.confidence_json as Record<string, "high" | "medium" | "low">) ?? undefined,
      studyMode,
      cramSettings: cramSettings as Parameters<typeof generateExamStudyPlan>[0]["cramSettings"],
    });

    const isCram = studyMode === "cram" && "roiTopics" in plan;

    const upsertPayload: Record<string, unknown> = {
      exam_id: id,
      study_mode: studyMode,
    };

    if (isCram) {
      const cramPlan = plan as CramStudyPlanOutput;
      upsertPayload.topic_analysis = [];
      upsertPayload.prioritization = cramPlan.roiTopics;
      upsertPayload.time_allocation = {};
      upsertPayload.sessions = [];
      upsertPayload.calendar = cramPlan.dailySchedule;
      upsertPayload.insights = cramPlan.insights;
      upsertPayload.cram_sheet_json = cramPlan.cramSheet;
    } else {
      const balancedPlan = plan as ExamStudyPlanOutput;
      upsertPayload.topic_analysis = balancedPlan.topicAnalysis;
      upsertPayload.prioritization = balancedPlan.prioritization;
      upsertPayload.time_allocation = balancedPlan.timeAllocation;
      upsertPayload.sessions = balancedPlan.sessions;
      upsertPayload.calendar = balancedPlan.calendar;
      upsertPayload.insights = balancedPlan.insights;
      upsertPayload.cram_sheet_json = {};
    }

    const { error: upsertError } = await supabase
      .from("exam_study_plans")
      .upsert(upsertPayload, { onConflict: "exam_id" });

    if (upsertError) {
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Exam study plan generation error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Study plan generation failed",
      },
      { status: 500 }
    );
  }
}
