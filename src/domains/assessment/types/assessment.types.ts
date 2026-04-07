export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

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