import type {
  Assessment,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AssessmentDeliveryMode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AssessmentLifecycle,
} from "./assessment.types";

export interface AssessmentCatalogItem extends Assessment {
  questionCount?: number;
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
