export interface QuestionSnapshot {
  id: string;
  questionText: string;
  typeId: string;
  points: number;
  options?: {
    id: string;
    text: string;
  }[];
  correctAnswers: unknown;
}
