import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title: string;
    exam_date: string;
    daily_hours?: number;
    materials_text?: string;
    confidence_json?: Record<string, "high" | "medium" | "low">;
    study_mode?: "balanced" | "cram";
    cram_settings_json?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!body.exam_date) {
    return NextResponse.json({ error: "Exam date is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("exams")
    .insert({
      user_id: user.id,
      title: body.title.trim(),
      exam_date: body.exam_date,
      daily_hours: body.daily_hours ?? 3,
      materials_text: body.materials_text?.trim() ?? null,
      confidence_json: body.confidence_json ?? {},
      study_mode: body.study_mode ?? "balanced",
      cram_settings_json: body.cram_settings_json ?? {},
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data?.id });
}
