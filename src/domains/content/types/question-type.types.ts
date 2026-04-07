export type GradingStrategy =
  | "BINARY"
  | "DEDUCTIVE"
  | "SCALED"
  | "MANUAL_AI";

export interface QuestionType {
  id: string;
  name: string;
  grading_strategy: GradingStrategy;
  has_options: boolean;
  supports_ai: boolean;
  is_manual_only: boolean;
  default_max_score: number;
  description: string;
}