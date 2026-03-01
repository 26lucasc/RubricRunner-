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

  const { data: assignment, error: fetchError } = await supabase
    .from("assignments")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !assignment || assignment.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("assignments")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
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

  const { data: assignment, error: fetchError } = await supabase
    .from("assignments")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !assignment || assignment.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: {
    title?: string;
    prompt_text?: string;
    rubric_text?: string;
    due_at?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.prompt_text !== undefined) updates.prompt_text = body.prompt_text.trim();
  if (body.rubric_text !== undefined) updates.rubric_text = body.rubric_text.trim();
  if (body.due_at !== undefined) updates.due_at = body.due_at;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("assignments")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
