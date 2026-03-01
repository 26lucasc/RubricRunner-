import { createClient } from "@/lib/supabase/server";
import type { ChecklistItem, ExtractedRubric, GeneratedOutput } from "./types";
import { extractRubric } from "./extractor";
import { generatePlan } from "./plan-generator";
import { scanRisks } from "./risk-scanner";
import { extractTextFromPdfViaLlm } from "./pdf-extractor";

export async function generateForAssignment(assignmentId: string): Promise<GeneratedOutput> {
  const supabase = await createClient();

  const { data: assignment, error: assignError } = await supabase
    .from("assignments")
    .select("prompt_text, rubric_text, prompt_pdf_path, rubric_pdf_path, due_at")
    .eq("id", assignmentId)
    .single();

  if (assignError || !assignment) {
    throw new Error("Assignment not found");
  }

  let promptText = assignment.prompt_text ?? "";
  let rubricText = assignment.rubric_text ?? "";

  if (assignment.prompt_pdf_path) {
    const { data: pdfData, error: pdfError } = await supabase.storage
      .from("assignment-pdfs")
      .download(assignment.prompt_pdf_path);
    if (pdfError || !pdfData) {
      throw new Error("Could not load prompt PDF");
    }
    const buffer = Buffer.from(await pdfData.arrayBuffer());
    const base64 = buffer.toString("base64");
    promptText = await extractTextFromPdfViaLlm(base64, "prompt");
  }

  if (assignment.rubric_pdf_path) {
    const { data: pdfData, error: pdfError } = await supabase.storage
      .from("assignment-pdfs")
      .download(assignment.rubric_pdf_path);
    if (pdfError || !pdfData) {
      throw new Error("Could not load rubric PDF");
    }
    const buffer = Buffer.from(await pdfData.arrayBuffer());
    const base64 = buffer.toString("base64");
    rubricText = await extractTextFromPdfViaLlm(base64, "rubric");
  }

  if (!promptText || !rubricText) {
    throw new Error("Assignment must have prompt and rubric (text or PDF)");
  }

  // Save extracted text back to assignment for display/edit
  if (assignment.prompt_pdf_path || assignment.rubric_pdf_path) {
    await supabase
      .from("assignments")
      .update({
        prompt_text: promptText,
        rubric_text: rubricText,
      })
      .eq("id", assignmentId);
  }

  const rubric = await extractRubric(rubricText);

  await supabase.from("rubric_items").delete().eq("assignment_id", assignmentId);
  for (const item of rubric.items) {
    await supabase.from("rubric_items").insert({
      assignment_id: assignmentId,
      category: item.category,
      points: item.points,
      requirements: item.requirements,
    });
  }

  const { planMd, outlineMd } = await generatePlan(
    promptText,
    rubric,
    new Date(assignment.due_at)
  );

  const risks = await scanRisks(
    promptText,
    rubricText,
    planMd
  );

  const checklist: ChecklistItem[] = rubric.items.flatMap((item, i) =>
    item.requirements.map((req, j) => ({
      id: `r-${i}-${j}`,
      text: req,
      category: item.category,
      completed: false,
    }))
  );

  const output: GeneratedOutput = {
    planMd,
    outlineMd,
    checklist,
    risks,
  };

  await supabase.from("outputs").upsert(
    {
      assignment_id: assignmentId,
      plan_md: planMd,
      outline_md: outlineMd,
      checklist_json: checklist,
      risks_json: risks,
    },
    { onConflict: "assignment_id" }
  );

  return output;
}
