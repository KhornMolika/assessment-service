import { z } from "zod";
import { correctAnswerSchema } from "./question-correct-answer.schema";

export const questionSnapshotSchema = z.object({
  id: z.string(),
  question_text: z.string(),
  type_id: z.string(),
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
  sheet_id: z.string(),
  question_id: z.string(),

  response: z.union([z.string(), z.record(z.any(), z.any())]),
  question_snapshot: questionSnapshotSchema,

  is_correct: z.boolean().nullable(),
  score_awarded: z.number().nonnegative(),
  grading_status: z.enum(["AUTOMATIC", "PENDING", "AI_EVALUATED", "MANUAL_REVISED"]),
  graded_at: z.string().nullable(),
  updated_at: z.string(),
});
