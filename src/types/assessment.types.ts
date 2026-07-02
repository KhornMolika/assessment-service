export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AssessmentDeliveryMode = "SELF_PACED" | "REAL_TIME";

export type AssessmentLifecycle =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export interface Assessment {
  id: string;
  topicId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  topic?: any;
  ownerId?: string;
  name: string;
  description?: string;
  status: AssessmentStatus;
  type?: "QUIZ" | "EXAM" | "PRACTICE" | "SURVEY";
  createdAt: string;
  updatedAt: string;
  settings?: {
    mode: "SELF_PACED" | "REAL_TIME";
    questionSelection: "MANUAL" | "DYNAMIC";
    numQuestions: number;
    timeLimit: number | null;
    startsAt: string | null;
    endsAt: string | null;
    passMark: number;
    isShuffle: boolean;
    participantIdentity?: "ANONYMOUS" | "AUTHENTICATED" | "EXTERNAL";
    showResults?: string;
    gradeLabels?: Array<{ grade: string; minPercent: number }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectionRules?: any;
    allowReview?: boolean;
    isAllowShare?: boolean;
  };
}
