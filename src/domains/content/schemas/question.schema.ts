import { z } from "zod";
import { correctAnswerSchema } from "./correct-answer.schema";

export const questionSchema = z.object({
  id: z.string(),
  bank_id: z.string().nullable(),
  type_id: z.string(),
  question_text: z.string(),
  language: z.enum(["EN", "KH"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.number(),
  tags: z.array(z.string()),
  settings: z.record(z.any(),z.any()),
  correct_answer: correctAnswerSchema,
  created_at: z.string()
});

export type Question =  z.infer<typeof questionSchema>
