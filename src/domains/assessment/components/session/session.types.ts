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

export type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  streak: number;
  lastGain: number;
  rank: number;
  previousRank: number;
};

export type HostPhase = "lobby" | "reveal" | "correct" | "leaderboard" | "winner";

export type JoinPhase = "lobby" | "pick_option" | "result" | "final";
