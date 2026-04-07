export const userRoles = ["Admin", "Creator", "Participant"] as const;
export type UserRole = typeof userRoles[number];

export interface User {
  id: string
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  bio?: string;
  locale: "en" | "kh";
  created_at: string;
  updated_at: string;
}