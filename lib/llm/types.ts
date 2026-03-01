export interface RubricItem {
  category: string;
  points: number;
  requirements: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  category?: string;
  completed: boolean;
}

export interface RiskItem {
  type: "missing_section" | "word_count" | "citation" | "other";
  severity: "high" | "medium" | "low";
  description: string;
  suggestion?: string;
}

export interface ExtractedRubric {
  items: RubricItem[];
  totalPoints: number;
}

export interface GeneratedOutput {
  planMd: string;
  outlineMd: string;
  checklist: ChecklistItem[];
  risks: RiskItem[];
}
