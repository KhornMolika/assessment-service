export interface QuestionSnapshot {
  id: string;
  question_text: string;
  type_id: string;
  points: number;
  options?: {
    id: string;
    text: string;
  }[];
  correct_answer: unknown;
}