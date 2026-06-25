import type { CorrectAnswer } from "./question-correct-answer.types";
import type { QuestionSettings } from "./question-settings.types";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  bankId: string | null;
  typeId: string;
  questionText: string;
  language: "EN" | "KH";
  difficulty: Difficulty;
  points: number;
  tags: string[];
  settings: QuestionSettings;
  correctAnswers: CorrectAnswer;
  createdAt: string;
  updatedAt: string;
}
