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
}

export interface AssessmentDetailRecord extends AssessmentCatalogItem {
  subtitle: string;
  source_bank: string;
  completed_count: number;
  in_progress_count: number;
  average_score_percent: number;
  pass_rate_percent: number;
  live_sessions: number;
  active_sessions: number;
  total_points: number;
  time_limit_minutes: number;
  created_by: string;
  question_selection: "Dynamic" | "Manual";
  shuffle_questions: boolean;
  allow_going_back: boolean;
  pass_mark: number;
  show_results: string;
  is_allowed_share: boolean;
  is_showed_answers: boolean;
  grade_scale: AssessmentDetailGradeBand[];
}

export interface AssessmentDetailPageData {
  assessment: AssessmentDetailRecord;
  questions: AssessmentDetailQuestionItem[];
}
