export type ResultsRow = {
  sheet_id: string;
  assessment_id: string;
  participant_id: string;
  participant_display_name: string;
  assessment_title: string;
  answer_sheet_status: "IN_PROGRESS" | "SUBMITTED" | "REVIEW_PENDING" | "REVIEWED";
  total_score: number | null;
  max_score: number;
  percentage: number | null;
  grade: string | null;
  outcomeStatus: "PASSED" | "FAILED" | "PENDING_REVIEW";
  evaluationStatus: "FINAL" | "PENDING_REVIEW";
  timeSpent: string;
  submittedAt: string;
  sessionInfo: string;
};
