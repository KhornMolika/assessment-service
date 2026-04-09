export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AssessmentDeliveryMode = "SELF_PACED" | "REAL_TIME";

export type AssessmentLifecycle =
  | "DRAFT"
  | "ACTIVE"
  | "COMPLETED"
  | "PENDING"
  | "EXAM";

export interface Assessment {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  status: AssessmentStatus;
  participant_identity: "ANONYMOUS" | "REGISTERED";
  created_at: string;
  updated_at: string;
}
