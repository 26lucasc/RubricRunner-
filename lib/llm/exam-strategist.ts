import OpenAI from "openai";
import type {
  ExamStudyPlanOutput,
  CramStudyPlanOutput,
  CramSettings,
} from "./exam-types";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are an elite academic strategist. Your job is NOT to summarize content. Your job is to:

1. Analyze exam materials and infer what is most likely to appear on the test
2. Prioritize topics based on importance and difficulty
3. Allocate study time based on time remaining
4. Generate a day-by-day study calendar
5. Design active study sessions (not passive review)

You optimize for: maximum exam score, efficient time allocation, active recall, retention, avoiding burnout.
You do NOT give generic advice. You create a structured execution plan.

IMPORTANT: For session design, NEVER say "Review chapter 6." Instead use specific objectives like:
"Complete 8 inference problems under timed conditions and analyze error patterns."`;

function buildUserPrompt(params: {
  examTitle: string;
  examDate: string;
  dailyHours: number;
  daysRemaining: number;
  materialsText: string;
  confidenceJson: Record<string, "high" | "medium" | "low">;
}): string {
  const { examTitle, examDate, dailyHours, daysRemaining, materialsText, confidenceJson } = params;
  const confidenceStr =
    Object.keys(confidenceJson).length > 0
      ? `\nStudent confidence per topic (optional):\n${JSON.stringify(confidenceJson, null, 2)}`
      : "";

  return `EXAM TITLE: ${examTitle}
EXAM DATE: ${examDate}
DAYS REMAINING: ${daysRemaining}
DAILY AVAILABLE HOURS: ${dailyHours}
TOTAL STUDY HOURS AVAILABLE: ~${Math.max(1, daysRemaining * dailyHours - 2)} (reserve 1–2h buffer before exam)
${confidenceStr}

EXTRACTED CONTENT FROM MATERIALS:
${materialsText || "(No materials provided—use a representative topic structure for this exam type.)"}

---

Follow these steps and return ONE valid JSON object with this exact structure. Do not return markdown code fences—only valid JSON.

{
  "topicAnalysis": [
    {
      "name": "string",
      "weight": "High" | "Medium" | "Low",
      "difficulty": 1,
      "cognitiveVerbs": ["define" | "explain" | "analyze" | "evaluate" | "compare" | "other"],
      "estimatedExamPresence": "brief string"
    }
  ],
  "prioritization": [
    {
      "name": "string",
      "weight": "High" | "Medium" | "Low",
      "difficulty": 1,
      "cognitiveVerbs": [],
      "priorityScore": 0,
      "rank": 1,
      "reason": "Brief WHY this rank"
    }
  ],
  "timeAllocation": {
    "hoursPerTopic": [
      { "topicName": "string", "hours": 0, "sessionCount": 0 }
    ],
    "totalHours": 0,
    "bufferBeforeExam": 1,
    "summary": "brief string"
  },
  "sessions": [
    {
      "topic": "string",
      "durationMinutes": 0,
      "objective": "specific objective—not generic review",
      "method": "Active Recall" | "Timed FRQ" | "Practice Problems" | "Teach-back" | "Flashcards" | "Error Review",
      "output": "what the student produces"
    }
  ],
  "calendar": [
    {
      "date": "YYYY-MM-DD",
      "blocks": [
        {
          "timeBlock": "e.g. 9:00–11:00",
          "topic": "string",
          "task": "specific task",
          "cognitiveLoad": "Light" | "Moderate" | "Heavy"
        }
      ]
    }
  ],
  "insights": {
    "topScoreRisks": ["risk1", "risk2", "risk3"],
    "topROIActions": ["action1", "action2", "action3"],
    "predictedPreparednessLevel": "string e.g. Strong / Solid / Needs work"
  }
}

RULES:
- Priority score = Topic Weight (3/2/1) × Difficulty (1–5) × Weakness Factor (high=0.7, medium=1.0, low=1.4)
- Rank topics highest to lowest priority
- Hardest topics appear earlier in the calendar
- Final 2 days: mixed review
- Final day: light + confidence reinforcement
- Avoid >2 heavy sessions in a row
- Include at least 1 cumulative review and 1 timed simulation before exam
- Dates in calendar must be from today up to exam date`;
}

function buildCramUserPrompt(params: {
  examTitle: string;
  examDate: string;
  dailyHours: number;
  daysRemaining: number;
  materialsText: string;
  confidenceJson: Record<string, "high" | "medium" | "low">;
  cramSettings: CramSettings;
}): string {
  const {
    examTitle,
    examDate,
    dailyHours,
    daysRemaining,
    materialsText,
    confidenceJson,
    cramSettings,
  } = params;
  const confidenceStr =
    Object.keys(confidenceJson).length > 0
      ? `\nStudent confidence per topic:\n${JSON.stringify(confidenceJson, null, 2)}`
      : "";

  return `CRAM MODE — High-intensity last-minute study plan.

EXAM: ${examTitle}
EXAM DATE: ${examDate}
DAYS REMAINING: ${daysRemaining}
DAILY HOURS: ${dailyHours}
INTENSITY: ${cramSettings.intensity}
SESSION LENGTH: ${cramSettings.sessionLength} min
BREAK: ${cramSettings.breakMinutesPer25} min per 25 min
TIMED SIMULATION: ${cramSettings.includeTimedSimulation ? "Yes" : "No"}
PROTECT SLEEP: ${cramSettings.protectSleep ? `Yes (stop after ${cramSettings.sleepCutoffTime ?? "22:30"})` : "No"}
${confidenceStr}

MATERIALS:
${materialsText || "(No materials—use representative structure.)"}

Return ONE valid JSON object. No markdown fences—only JSON.

{
  "roiTopics": [
    {
      "name": "string",
      "weight": "High" | "Medium" | "Low",
      "confidence": "high" | "medium" | "low" (optional),
      "roiScore": 0,
      "recommendedAction": "FRQ" | "MCQ" | "drills" | "teach-back"
    }
  ],
  "dailySchedule": [
    {
      "date": "YYYY-MM-DD",
      "blocks": [
        {
          "topic": "string",
          "task": "very specific task (e.g. 'timed set of 12 MCQ')",
          "durationMinutes": 0,
          "timerFormat": "e.g. 45 min timed",
          "deliverable": "what to produce (e.g. 'error log + 10 corrected problems')"
        }
      ]
    }
  ],
  "cramSheet": {
    "formulasAndDefs": ["item1", "item2"],
    "commonTraps": ["trap1", "trap2"],
    "exampleProblems": ["problem1", "problem2", "problem3"],
    "topMistakes": ["mistake1", "mistake2"]
  },
  "insights": {
    "topScoreRisks": ["risk1", "risk2", "risk3"],
    "topROIActions": ["action1", "action2", "action3"],
    "predictedPreparednessLevel": "string"
  }
}

RULES:
- Top 5–10 ROI topics only. priority = weight(3/2/1) × difficulty(1–5) × weakness(0.7/1.0/1.4). If weakness unknown, assume medium.
- 70% practice (timed), 20% active recall, 10% cram sheet consolidation
- Every 2–3 sessions: Timed practice → Error review → Targeted drill → Mixed review
- Last day: NO new hard topics. Light mixed review. 1 short timed set early, then review mistakes
- Blocks must have specific tasks and deliverables, NOT "review chapter 6"
- Protect sleep: no blocks after cutoff if enabled
- Dates from today to exam date`;
}

const CRAM_SYSTEM_PROMPT = `You are a cram-mode study strategist. Create high-intensity, actionable study plans for students with limited time.

- Prioritize highest-weight, highest-yield topics
- Minimize passive reading; maximize practice and error loops
- Sessions must be short, specific, and followable
- Each block needs: topic, specific task, timer format, deliverable
- Build a 1-page cram sheet: formulas/defs, common traps, 3 example problems, top mistakes`;

export async function generateCramStudyPlan(params: {
  examTitle: string;
  examDate: Date;
  dailyHours: number;
  materialsText: string;
  confidenceJson?: Record<string, "high" | "medium" | "low">;
  cramSettings: CramSettings;
}): Promise<CramStudyPlanOutput> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(params.examDate);
  examDate.setHours(0, 0, 0, 0);
  const daysRemaining = Math.max(
    1,
    Math.ceil((examDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
  );

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: CRAM_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildCramUserPrompt({
          examTitle: params.examTitle,
          examDate: params.examDate.toISOString().slice(0, 10),
          dailyHours: params.dailyHours,
          daysRemaining,
          materialsText: params.materialsText,
          confidenceJson: params.confidenceJson ?? {},
          cramSettings: params.cramSettings,
        }),
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from cram strategist");

  const raw = JSON.parse(content) as unknown;
  return normalizeCramOutput(raw);
}

function normalizeCramOutput(raw: unknown): CramStudyPlanOutput {
  const o = raw as Record<string, unknown>;
  const roiTopics = Array.isArray(o.roiTopics) ? o.roiTopics : [];
  const dailySchedule = Array.isArray(o.dailySchedule) ? o.dailySchedule : [];
  const cramSheetRaw = o.cramSheet as Record<string, unknown> | undefined;
  const formulasAndDefs = Array.isArray(cramSheetRaw?.formulasAndDefs) ? cramSheetRaw.formulasAndDefs : [];
  const commonTraps = Array.isArray(cramSheetRaw?.commonTraps) ? cramSheetRaw.commonTraps : [];
  const exampleProblems = Array.isArray(cramSheetRaw?.exampleProblems) ? cramSheetRaw.exampleProblems : [];
  const topMistakes = Array.isArray(cramSheetRaw?.topMistakes) ? cramSheetRaw.topMistakes : [];

  const insightsRaw = o.insights as Record<string, unknown> | undefined;
  const topScoreRisks = Array.isArray(insightsRaw?.topScoreRisks) ? insightsRaw.topScoreRisks : [];
  const topROIActions = Array.isArray(insightsRaw?.topROIActions) ? insightsRaw.topROIActions : [];
  const predictedPreparednessLevel =
    typeof insightsRaw?.predictedPreparednessLevel === "string"
      ? insightsRaw.predictedPreparednessLevel
      : "Unknown";

  return {
    roiTopics,
    dailySchedule,
    cramSheet: {
      formulasAndDefs,
      commonTraps,
      exampleProblems,
      topMistakes,
    },
    insights: {
      topScoreRisks,
      topROIActions,
      predictedPreparednessLevel,
    },
  };
}

export async function generateExamStudyPlan(params: {
  examTitle: string;
  examDate: Date;
  dailyHours: number;
  materialsText: string;
  confidenceJson?: Record<string, "high" | "medium" | "low">;
  studyMode?: "balanced" | "cram";
  cramSettings?: CramSettings;
}): Promise<ExamStudyPlanOutput | CramStudyPlanOutput> {
  if (params.studyMode === "cram" && params.cramSettings) {
    return generateCramStudyPlan({
      examTitle: params.examTitle,
      examDate: params.examDate,
      dailyHours: params.dailyHours,
      materialsText: params.materialsText,
      confidenceJson: params.confidenceJson,
      cramSettings: params.cramSettings,
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(params.examDate);
  examDate.setHours(0, 0, 0, 0);
  const daysRemaining = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt({
          examTitle: params.examTitle,
          examDate: params.examDate.toISOString().slice(0, 10),
          dailyHours: params.dailyHours,
          daysRemaining,
          materialsText: params.materialsText,
          confidenceJson: params.confidenceJson ?? {},
        }),
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from exam strategist");
  }

  const raw = JSON.parse(content) as unknown;
  return normalizeOutput(raw);
}

function normalizeOutput(raw: unknown): ExamStudyPlanOutput {
  const o = raw as Record<string, unknown>;

  const topicAnalysis = Array.isArray(o.topicAnalysis) ? o.topicAnalysis : [];
  const prioritization = Array.isArray(o.prioritization) ? o.prioritization : [];
  const sessions = Array.isArray(o.sessions) ? o.sessions : [];
  const calendar = Array.isArray(o.calendar) ? o.calendar : [];

  const timeAlloc = o.timeAllocation as Record<string, unknown> | undefined;
  const hoursPerTopic = Array.isArray(timeAlloc?.hoursPerTopic) ? timeAlloc.hoursPerTopic : [];
  const totalHours = typeof timeAlloc?.totalHours === "number" ? timeAlloc.totalHours : 0;
  const bufferBeforeExam = typeof timeAlloc?.bufferBeforeExam === "number" ? timeAlloc.bufferBeforeExam : 1;
  const summary = typeof timeAlloc?.summary === "string" ? timeAlloc.summary : undefined;

  const insightsRaw = o.insights as Record<string, unknown> | undefined;
  const topScoreRisks = Array.isArray(insightsRaw?.topScoreRisks) ? insightsRaw.topScoreRisks : [];
  const topROIActions = Array.isArray(insightsRaw?.topROIActions) ? insightsRaw.topROIActions : [];
  const predictedPreparednessLevel =
    typeof insightsRaw?.predictedPreparednessLevel === "string"
      ? insightsRaw.predictedPreparednessLevel
      : "Unknown";

  return {
    topicAnalysis,
    prioritization,
    timeAllocation: {
      hoursPerTopic,
      totalHours,
      bufferBeforeExam,
      summary,
    },
    sessions,
    calendar,
    insights: {
      topScoreRisks,
      topROIActions,
      predictedPreparednessLevel,
    },
  };
}
