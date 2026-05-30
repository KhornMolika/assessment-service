export type BankVisibility = "PRIVATE" | "ORG" | "PUBLIC";

export interface Bank {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  tags: string[];
  visibility: BankVisibility;
  question_count: number;
  created_at: string;
}
