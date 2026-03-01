import OpenAI from "openai";
import type { ExtractedRubric } from "./types";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generatePlan(
  promptText: string,
  rubric: ExtractedRubric,
  dueAt: Date
): Promise<{ planMd: string; outlineMd: string }> {
  const rubricSummary = rubric.items
    .map(
      (i) =>
        `- ${i.category} (${i.points} pts): ${i.requirements.join("; ")}`
    )
    .join("\n");

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an academic execution coach. Create a battle plan and outline for a student assignment.

Given an assignment prompt, rubric, and due date, produce:
1. A step-by-step execution plan (planMd) with time estimates for each step. Include a daily breakdown based on the due date. Format as markdown with headers and bullet points.
2. An outline (outlineMd) that mirrors the rubric structure exactly - each rubric category becomes a section. Use markdown headers (##, ###) and bullet points.

Return valid JSON:
{
  "planMd": "markdown string",
  "outlineMd": "markdown string"
}`,
      },
      {
        role: "user",
        content: `Assignment prompt:\n${promptText}\n\nRubric:\n${rubricSummary}\n\nDue date: ${dueAt.toISOString().slice(0, 10)}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from plan generator");
  }

  const parsed = JSON.parse(content) as { planMd: string; outlineMd: string };
  return {
    planMd: parsed.planMd ?? "",
    outlineMd: parsed.outlineMd ?? "",
  };
}
