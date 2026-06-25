export interface AnswerSheet {
  id: string;
  participantId: string;
  assessmentId: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "REVIEW_PENDING" | "REVIEWED";
  totalScore: number | null;
  maxScore: number;
  grade: string | null;
  isPassed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
  shareToken: string;
}
