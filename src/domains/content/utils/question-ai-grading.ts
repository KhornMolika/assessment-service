import type { QuestionFormType } from "@/src/domains/content/types/question-form.types";

export const AI_GRADING_QUESTION_TYPES: QuestionFormType[] = ["Short Answer", "Essay", "File Upload"];

export function supportsAiGradingInstructions(questionType: QuestionFormType) {
  return AI_GRADING_QUESTION_TYPES.includes(questionType);
}

