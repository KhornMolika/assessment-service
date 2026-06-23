export interface AnswerSheet {
  id: string;
  participant_id: string;
  assessment_id: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "REVIEW_PENDING" | "REVIEWED";
  total_score: number | null;
  max_score: number;
  grade: string | null;
  is_passed: boolean | null;
  started_at: string;
  submitted_at: string | null;
  share_token: string;
}
