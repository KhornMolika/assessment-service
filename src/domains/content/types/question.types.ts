import type { CorrectAnswer } from "./question-correct-answer.types";
import type { QuestionSettings } from "./question-settings.types";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  bank_id: string | null;
  type_id: string;
  question_text: string;
  language: "EN" | "KH";
  difficulty: Difficulty;
  points: number;
  tags: string[];
  settings: QuestionSettings;
  correct_answer: CorrectAnswer;
  created_at: string;
  updated_at: string;
}
