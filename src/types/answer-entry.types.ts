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
  sheetId: string;
  questionId: string;

  response: string | Record<string, unknown>;
  questionSnapshot: QuestionSnapshot;

  isCorrect: boolean | null;
  scoreAwarded: number;
  gradingStatus: GradingStatus;
  gradedAt: string | null;
  updatedAt: string;
  aiGrading?: AIGradingInsight;
}
