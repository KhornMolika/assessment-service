import { QuestionSnapshot } from "./snapshot.types";

export type GradingStatus =
  | "AUTOMATIC"
  | "PENDING"
  | "AI_EVALUATED"
  | "MANUAL_REVISED";

export interface AIGradingInsight {
  suggestedScore: number | null;
  reasoning: string | null;
  keyPointsAddressed: string[];
  keyPointsMissed: string[];
  confidence: string | null;
  flagForReview: boolean;
}

export interface AnswerEntry {
  id: string;
  sheet_id: string;
  question_id: string;

  response: string | Record<string, unknown>;
  question_snapshot: QuestionSnapshot;

  is_correct: boolean | null;
  score_awarded: number;
  grading_status: GradingStatus;
  graded_at: string | null;
  updated_at: string;
  ai_grading?: AIGradingInsight;
}
