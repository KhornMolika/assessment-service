export type QuestionCatalogType =
  | "MCQ"
  | "Multiple Choice"
  | "True/False"
  | "Short Answer"
  | "Long Essay"
  | "Rating"
  | "Ranking"
  | "Fill-in-blank"
  | "File Upload"
  | "Matching";

export type QuestionCatalogDifficulty = "Easy" | "Medium" | "Hard";

export interface QuestionCatalogItem {
  id: string;
  bank_id: string;
  text: string;
  type: QuestionCatalogType;
  difficulty: QuestionCatalogDifficulty;
  points: number;
  language: "EN" | "KH";
  tags: string[];
}

export interface QuestionCatalogPageData {
  banks: import("./bank.types").Bank[];
  questions: QuestionCatalogItem[];
}
