import type {
  Assessment,
  AssessmentDeliveryMode,
  AssessmentLifecycle,
} from "./assessment.types";

export interface AssessmentCatalogItem extends Assessment {
  // Legacy mock fields (keep to avoid breaking other components)
  question_bank_name?: string;
  delivery_mode?: AssessmentDeliveryMode;
  lifecycle?: AssessmentLifecycle;
  question_count?: number;
  participant_count?: number;
  pass_rate?: string;
  average_score?: string;
  starts_at?: string;
  
  // Real backend fields
  name?: string;
  type?: "QUIZ" | "EXAM" | "PRACTICE" | "SURVEY";
  createdAt?: string;
  updatedAt?: string;
  settings?: {
    mode: "SELF_PACED" | "REAL_TIME";
    questionSelection: "MANUAL" | "DYNAMIC";
    numQuestions: number;
    timeLimit: number | null;
    startsAt: string | null;
    endsAt: string | null;
    passMark: number;
    isShuffle: boolean;
    participantIdentity?: string;
    showResults?: string;
    gradeLabels?: Array<{ grade: string; minPercent: number }>;
    selectionRules?: any;
  };
}

export interface AssessmentCatalogStats {
  totalAssessments: number;
  draftCount: number;
  activeCount: number;
  selfPacedCount: number;
  realTimeCount: number;
  startingThisWeekCount: number;
}

export interface AssessmentCatalogPageData {
  assessments: AssessmentCatalogItem[];
  stats: AssessmentCatalogStats;
}
