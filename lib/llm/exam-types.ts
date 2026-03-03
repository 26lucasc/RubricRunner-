/** Exam strategist types — aligned with LLM output schema */

export type TopicWeight = "High" | "Medium" | "Low";
export type CognitiveVerb = "define" | "explain" | "analyze" | "evaluate" | "compare" | "other";

export interface ExamTopic {
  name: string;
  weight: TopicWeight;
  difficulty: 1 | 2 | 3 | 4 | 5;
  cognitiveVerbs: CognitiveVerb[];
  estimatedExamPresence?: string;
}

export interface PrioritizedTopic extends ExamTopic {
  priorityScore: number;
  rank: number;
  reason: string;
}

export interface TimeAllocation {
  topicName: string;
  hours: number;
  sessionCount: number;
}

export interface SessionDesign {
  topic: string;
  durationMinutes: number;
  objective: string;
  method: "Active Recall" | "Timed FRQ" | "Practice Problems" | "Teach-back" | "Flashcards" | "Error Review";
  output: string;
}

export interface CalendarBlock {
  date: string;
  blocks: {
    timeBlock: string;
    topic: string;
    task: string;
    cognitiveLoad: "Light" | "Moderate" | "Heavy";
  }[];
}

export interface StrategicInsights {
  topScoreRisks: string[];
  topROIActions: string[];
  predictedPreparednessLevel: string;
}

export interface ExamStudyPlanOutput {
  topicAnalysis: ExamTopic[];
  prioritization: PrioritizedTopic[];
  timeAllocation: {
    hoursPerTopic: TimeAllocation[];
    totalHours: number;
    bufferBeforeExam: number;
    summary?: string;
  };
  sessions: SessionDesign[];
  calendar: CalendarBlock[];
  insights: StrategicInsights;
}

// Cram Mode types

export type CramIntensity = "Normal" | "Aggressive" | "Insane";
export type CramSessionLength = 25 | 45 | 60;
export type CramRecommendedAction = "FRQ" | "MCQ" | "drills" | "teach-back";

export interface CramSettings {
  intensity: CramIntensity;
  sessionLength: CramSessionLength;
  breakMinutesPer25: number;
  includeTimedSimulation: boolean;
  protectSleep: boolean;
  sleepCutoffTime?: string; // e.g. "22:30"
}

export interface CramROITopic {
  name: string;
  weight: TopicWeight;
  confidence?: "high" | "medium" | "low";
  roiScore: number;
  recommendedAction: CramRecommendedAction;
}

export interface CramScheduleBlock {
  topic: string;
  task: string;
  durationMinutes: number;
  timerFormat?: string; // e.g. "45 min timed"
  deliverable: string;
}

export interface CramDayBlock {
  date: string;
  blocks: CramScheduleBlock[];
}

export interface CramSheetSection {
  formulasAndDefs: string[];
  commonTraps: string[];
  exampleProblems: string[];
  topMistakes: string[];
}

export interface CramStudyPlanOutput {
  roiTopics: CramROITopic[];
  dailySchedule: CramDayBlock[];
  cramSheet: CramSheetSection;
  insights: StrategicInsights;
}
