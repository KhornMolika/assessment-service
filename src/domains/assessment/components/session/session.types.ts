import type {
  AssessmentDetailQuestionItem,
} from "@/src/domains/assessment/types";

export type ResultReleaseMode = "immediate" | "manual" | "hidden";

export type QuestionOption = {
  id: string;
  label: string;
  text: string;
};

export type QuestionRound = AssessmentDetailQuestionItem & {
  options: QuestionOption[];
  correctOptionId: string;
};

export type HostPhase = "lobby" | "reveal" | "correct" | "leaderboard" | "winner";

export type JoinPhase = "lobby" | "question_locked" | "question_active" | "result" | "final";
