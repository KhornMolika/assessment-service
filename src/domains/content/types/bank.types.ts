export type ContentLanguage = "EN" | "KH";

export interface Bank {
  id: string;
  name: string;
  description: string;
  subject: string;
  language: ContentLanguage;
  question_count: number;
  created_at: string;
  updated_at: string;
}
