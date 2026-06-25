import type {
  Assessment,
  AssessmentDeliveryMode,
  AssessmentLifecycle,
} from "./assessment.types";

export interface AssessmentCatalogItem extends Assessment {
  stats?: {
    participantCount: number;
    passRate: number;
    averageScore: number;
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
