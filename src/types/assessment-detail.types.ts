import type { AssessmentCatalogItem } from "./assessment-catalog.types";

export interface AssessmentDetailGradeBand {
  grade: string;
  minPercent: number;
}

export interface AssessmentDetailTopPerformer {
  name: string;
  score: number;
  time: string;
}

export interface AssessmentDetailActivityItem {
  name: string;
  action: "completed" | "started";
  time: string;
  score: number | null;
}

export interface AssessmentDetailQuestionItem {
  id: string; // assessmentQuestionId
  question_id?: string; // source questionId
  question: string;
  type: string;
  points: number;
  options?: any;
  correctAnswers?: any;
  rawOptions?: any;
}

export interface AssessmentDetailRecord extends AssessmentCatalogItem {
  detailStats?: {
    completedCount: number;
    inProgressCount: number;
    averageScorePercent: number;
    passRatePercent: number;
    liveSessions: number;
    activeSessions: number;
    totalPoints: number;
  };
}

export interface AssessmentDetailPageData {
  assessment: AssessmentDetailRecord;
  questions: AssessmentDetailQuestionItem[];
}
