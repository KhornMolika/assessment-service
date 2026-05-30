import type {
  Assessment,
  AssessmentDeliveryMode,
  AssessmentLifecycle,
} from "./assessment.types";

export interface AssessmentCatalogItem extends Assessment {
  question_bank_name: string;
  delivery_mode: AssessmentDeliveryMode;
  lifecycle: AssessmentLifecycle;
  question_count: number;
  participant_count: number;
  pass_rate: string;
  average_score: string;
  starts_at: string;
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
