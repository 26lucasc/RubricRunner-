import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

  const { data: assignment } = await supabase
    .from("assignments")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!assignment || assignment.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { generateForAssignment } = await import("@/lib/llm/generate");
    await generateForAssignment(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
