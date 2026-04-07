import { z } from "zod";
import { userRoles } from "../types/user.types";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(userRoles),
  bio: z.string().optional(),
  locale: z.enum(["en", "kh"]),
  created_at: z.string()
});

