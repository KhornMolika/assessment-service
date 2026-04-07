import { CorrectAnswer } from "./correct-answer.types";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  bank_id: string;
  type_id: string;
  question_text: string;
  language: "EN" | "KH";
  difficulty: Difficulty;
  points: number;
  tags: string[];                // ["math", "algebra", "easy"]
  settings: Record<string, any>; // Per-type config (e.g. scale range for rating, blank positions for fill-in)
  correct_answer: CorrectAnswer;
  created_at: string;
  updated_at: string;
}