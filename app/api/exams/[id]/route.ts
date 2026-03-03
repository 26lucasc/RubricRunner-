import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
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
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !exam || exam.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: deleteError } = await supabase.from("exams").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
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
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !exam || exam.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: {
    title?: string;
    exam_date?: string;
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

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.exam_date !== undefined) updates.exam_date = body.exam_date;
  if (body.daily_hours !== undefined) updates.daily_hours = body.daily_hours;
  if (body.materials_text !== undefined) updates.materials_text = body.materials_text?.trim() ?? null;
  if (body.confidence_json !== undefined) updates.confidence_json = body.confidence_json;
  if (body.study_mode !== undefined) updates.study_mode = body.study_mode;
  if (body.cram_settings_json !== undefined) updates.cram_settings_json = body.cram_settings_json;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("exams")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
