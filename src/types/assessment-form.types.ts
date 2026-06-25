import type {
  AssessmentDeliveryMode,
  AssessmentStatus,
} from "./assessment.types";

export type AssessmentQuestionSelectionMode = "MANUAL" | "DYNAMIC";

export type AssessmentResultReleaseMode = "IMMEDIATELY" | "MANUAL" | "NEVER";

export interface AssessmentGradeLabel {
  grade: string;
  minPercent: number;
}

export interface AssessmentSelectionRule {
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
}

export interface NewAssessmentFormData {
  name: string;
  type: "QUIZ" | "EXAM" | "SURVEY" | "PRACTICE";
  description: string;
  ownerTopicId: string;
  status: AssessmentStatus;
  participantIdentity: "ANONYMOUS" | "AUTHENTICATED" | "EXTERNAL";
  sessionMode: AssessmentDeliveryMode;
  questionSelection: AssessmentQuestionSelectionMode;
  selectedBankId: string;
  selectedQuestionIds: string[];
  initialQuestionIds: string[];
  totalQuestions: number;
  selectionRules: AssessmentSelectionRule[];
  enableTimeLimit: boolean;
  timeLimitMinutes: number;
  startsAt: string;
  endsAt: string;
  passMark: number;
  shuffleQuestions: boolean;
  gradeLabels: AssessmentGradeLabel[];
  showResults: AssessmentResultReleaseMode;
}
