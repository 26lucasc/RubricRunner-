import OpenAI from "openai";
import type { ExtractedRubric } from "./types";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface ScoreBreakdown {
  category: string;
  pointsPossible: number;
  pointsEarned: number;
  feedback: string;
}

export interface DraftScoreResult {
  totalPossible: number;
  totalEarned: number;
  percentage: number;
  breakdown: ScoreBreakdown[];
  overallFeedback: string;
  suggestions: string[];
}

export async function gradeDraft(
  draftContent: string,
  promptText: string,
  rubric: ExtractedRubric
): Promise<DraftScoreResult> {
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
        content: `You are a strict but fair grader. Evaluate the student's draft against the rubric.

Return valid JSON:
{
  "totalPossible": number,
  "totalEarned": number,
  "percentage": number (0-100),
  "breakdown": [
    {
      "category": "string",
      "pointsPossible": number,
      "pointsEarned": number,
      "feedback": "string"
    }
  ],
  "overallFeedback": "string",
  "suggestions": ["string", ...]
}
Be precise: match each rubric category, award points based on how well the draft meets requirements. Give actionable feedback.`,
      },
      {
        role: "user",
        content: `Assignment prompt:\n${promptText}\n\nRubric:\n${rubricSummary}\n\nStudent draft:\n${draftContent}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from draft grader");
  }

  return JSON.parse(content) as DraftScoreResult;
}
