import { z } from "zod";
import { correctAnswerSchema } from "../../content/schemas/correct-answer.schema";

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

  response: z.record(z.any(), z.any()),
  question_snapshot: questionSnapshotSchema,

  is_correct: z.boolean(),
  score_awarded: z.number().positive(),
  grading_status: z.enum
})