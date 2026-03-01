import { createClient } from "@/lib/supabase/server";
import type { ChecklistItem, ExtractedRubric, GeneratedOutput } from "./types";
import { extractRubric } from "./extractor";
import { generatePlan } from "./plan-generator";
import { scanRisks } from "./risk-scanner";

export async function generateForAssignment(assignmentId: string): Promise<GeneratedOutput> {
  const supabase = await createClient();

  const { data: assignment, error: assignError } = await supabase
    .from("assignments")
    .select("prompt_text, rubric_text, due_at")
    .eq("id", assignmentId)
    .single();

  if (assignError || !assignment) {
    throw new Error("Assignment not found");
  }

  const rubric = await extractRubric(assignment.rubric_text);

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
    assignment.prompt_text,
    rubric,
    new Date(assignment.due_at)
  );

  const risks = await scanRisks(
    assignment.prompt_text,
    assignment.rubric_text,
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
