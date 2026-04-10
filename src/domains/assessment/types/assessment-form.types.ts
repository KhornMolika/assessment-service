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
  titleEN: string;
  titleKH: string;
  descriptionEN: string;
  descriptionKH: string;
  status: AssessmentStatus;
  participantIdentity: "REGISTERED" | "ANONYMOUS" | "NAME";
  sessionMode: AssessmentDeliveryMode;
  questionSelection: AssessmentQuestionSelectionMode;
  selectedBankId: string;
  selectedQuestionIds: string[];
  totalQuestions: number;
  selectionRules: AssessmentSelectionRule[];
  enableTimeLimit: boolean;
  timeLimitMinutes: number;
  startsAt: string;
  endsAt: string;
  passMark: number;
  shuffleQuestions: boolean;
  allowGoingBack: boolean;
  gradeLabels: AssessmentGradeLabel[];
  showResults: AssessmentResultReleaseMode;
}
