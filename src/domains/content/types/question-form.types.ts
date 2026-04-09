export type QuestionFormType =
  | "Single Choice"
  | "Multiple Choices"
  | "True/False"
  | "Short Answer"
  | "Essay"
  | "Fill in the Blank"
  | "Matching"
  | "Ordering"
  | "Rating Scale"
  | "File Upload";

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
  points: string;
  difficulty: "Easy" | "Medium" | "Hard";
  language: "English (EN)" | "Khmer (KH)";
  tags: string;
  explanation: string;
  mediaUrl: string;
  options: string[];
  correctAnswers: number[];
  trueFalseAnswer: boolean;
  shortAnswerKeywords: string[];
  fillInBlankText: string;
  fillInBlankAnswers: string[];
  matchingPairs: MatchingPairFormValue[];
  orderItems: string[];
  ratingScale: number;
  ratingLabels: RatingLabelsFormValue;
  fileUploadTypes: string[];
  fileUploadMaxSize: number;
  fileUploadMaxFiles: number;
  fileUploadInstructions: string;
  aiScoring: boolean;
  manualModeration: boolean;
  rubric: string;
}

