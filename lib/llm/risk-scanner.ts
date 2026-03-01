import OpenAI from "openai";
import type { RiskItem } from "./types";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function scanRisks(
  promptText: string,
  rubricText: string,
  planMd: string
): Promise<RiskItem[]> {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a risk scanner for academic assignments. Analyze the prompt, rubric, and plan to identify potential deduction triggers.

Return valid JSON array of risks:
[
  {
    "type": "missing_section" | "word_count" | "citation" | "other",
    "severity": "high" | "medium" | "low",
    "description": "string",
    "suggestion": "optional string"
  }
]
Flag: missing sections the rubric requires, word count risks, citation/format issues, and other common deduction causes.`,
      },
      {
        role: "user",
        content: `Prompt:\n${promptText}\n\nRubric:\n${rubricText}\n\nPlan:\n${planMd}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return [];
  }

  const parsed = JSON.parse(content) as
    | RiskItem[]
    | { risks?: RiskItem[]; items?: RiskItem[] };
  const risks = Array.isArray(parsed)
    ? parsed
    : parsed.risks ?? parsed.items ?? [];
  return risks as RiskItem[];
}
