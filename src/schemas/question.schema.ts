import { z } from "zod";
import { correctAnswerSchema } from "./question-correct-answer.schema";

export const questionSchema = z.object({
  id: z.string(),
  bankId: z.string().nullable(),
  typeId: z.string(),
  questionText: z.string(),
  language: z.enum(["EN", "KH"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.number(),
  tags: z.array(z.string()),
  settings: z.record(z.any(),z.any()),
  correctAnswers: correctAnswerSchema,
  createdAt: z.string()
});

export type Question =  z.infer<typeof questionSchema>
