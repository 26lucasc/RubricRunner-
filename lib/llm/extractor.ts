import OpenAI from "openai";
import type { ExtractedRubric, RubricItem } from "./types";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function extractRubric(rubricText: string): Promise<ExtractedRubric> {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a rubric parser. Extract structured data from rubric text.
Return valid JSON with this shape:
{
  "items": [
    { "category": "string", "points": number, "requirements": ["string", ...] }
  ],
  "totalPoints": number
}
Be thorough: capture every category, point value, and requirement. If points aren't explicit, infer from context.`,
      },
      {
        role: "user",
        content: rubricText,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from rubric extractor");
  }

  const parsed = JSON.parse(content) as {
    items: RubricItem[];
    totalPoints: number;
  };

  const totalPoints =
    parsed.totalPoints ??
    parsed.items.reduce((sum, i) => sum + (i.points || 0), 0);

  return {
    items: parsed.items ?? [],
    totalPoints,
  };
}
