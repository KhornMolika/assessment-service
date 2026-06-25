export type ResultsRow = {
  sheetId: string;
  assessmentId: string;
  participantId: string;
  participantDisplayName: string;
  assessmentTitle: string;
  answerSheetStatus: "IN_PROGRESS" | "SUBMITTED" | "REVIEW_PENDING" | "REVIEWED";
  totalScore: number | null;
  maxScore: number;
  percentage: number | null;
  grade: string | null;
  outcomeStatus: "PASSED" | "FAILED" | "PENDING_REVIEW";
  evaluationStatus: "FINAL" | "PENDING_REVIEW";
  timeSpent: string;
  submittedAt: string;
  sessionInfo: string;
};
