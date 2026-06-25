export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AssessmentDeliveryMode = "SELF_PACED" | "REAL_TIME";

export type AssessmentLifecycle =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export interface Assessment {
  id: string;
  topicId?: string;
  topic?: any;
  owner_id: string;
  title: string;
  description?: string;
  status: AssessmentStatus;
  participant_identity: "ANONYMOUS" | "INTERNAL" | "EXTERNAL";
  created_at: string;
  updated_at: string;
}
