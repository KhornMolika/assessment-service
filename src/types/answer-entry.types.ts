import { QuestionSnapshot } from "./snapshot.types";

export type GradingStatus =
  | "AUTOMATIC"
  | "PENDING"
  | "AI_EVALUATED"
  | "MANUAL_REVISED";

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
}
