import { z } from "zod";
import { correctAnswerSchema } from "./question-correct-answer.schema";

export const questionSnapshotSchema = z.object({
  id: z.string(),
  questionText: z.string(),
  typeId: z.string(),
  points: z.number(),
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string()
      })
    )
    .optional(),
  correct_answer: correctAnswerSchema
});

export const answerEntrySchema = z.object ({
  id: z.string(),
  sheetId: z.string(),
  questionId: z.string(),

  response: z.union([z.string(), z.record(z.any(), z.any())]),
  questionSnapshot: questionSnapshotSchema,

  isCorrect: z.boolean().nullable(),
  scoreAwarded: z.number().nonnegative(),
  gradingStatus: z.enum(["AUTOMATIC", "PENDING", "AI_EVALUATED", "MANUAL_REVISED"]),
  gradedAt: z.string().nullable(),
  updatedAt: z.string(),
});
