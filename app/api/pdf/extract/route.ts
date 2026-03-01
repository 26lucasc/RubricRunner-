import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdfViaLlm } from "@/lib/llm/pdf-extractor";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "prompt";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    if (type !== "prompt" && type !== "rubric") {
      return NextResponse.json(
        { error: "Type must be 'prompt' or 'rubric'" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const text = await extractTextFromPdfViaLlm(
      base64,
      type as "prompt" | "rubric"
    );

    return NextResponse.json({ text });
  } catch (err) {
    console.error("PDF extract error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to extract text from PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
