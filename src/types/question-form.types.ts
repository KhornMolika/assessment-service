export type QuestionFormType =
  | "Single Choice"
  | "Multiple Choices"
  | "True/False"
  | "Short Answer"
  | "Essay"
  | "Fill in the Blank"
  | "Matching"
  | "Ordering"
  | "Rating Scale";


export interface MatchingPairFormValue {
  left: string;
  right: string;
}

export interface RatingLabelsFormValue {
  min: string;
  max: string;
}

export interface QuestionFormData {
  questionText: string;
  questionType: QuestionFormType;
  bank: string;
  ownerTopicId: string;
  points: string;
  difficulty: "Easy" | "Medium" | "Hard";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  correctAnswers: any;
}
