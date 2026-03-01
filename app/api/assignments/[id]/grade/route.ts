import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

  const { data: assignment } = await supabase
    .from("assignments")
    .select("user_id, prompt_text, rubric_text")
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

  let body: { content: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const content = body.content?.trim();
  if (!content) {
    return NextResponse.json(
      { error: "Draft content is required" },
      { status: 400 }
    );
  }

  try {
    const { extractRubric } = await import("@/lib/llm/extractor");
    const { gradeDraft } = await import("@/lib/llm/draft-grader");
    const rubric = await extractRubric(assignment.rubric_text);
    const result = await gradeDraft(
      content,
      assignment.prompt_text,
      rubric
    );

    await supabase.from("drafts").insert({
      assignment_id: id,
      content_md: content,
      score_json: result,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Draft grading error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Grading failed" },
      { status: 500 }
    );
  }
}
