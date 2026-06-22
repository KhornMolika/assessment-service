import { z } from "zod";
import type { QuestionFormType } from "@/src/types/question-form.types";

const questionTypes = [
  "Single Choice",
  "Multiple Choices",
  "True/False",
  "Short Answer",
  "Essay",
  "Fill in the Blank",
  "Matching",
  "Ordering",
  "Rating Scale",
] as const satisfies readonly QuestionFormType[];

export const questionFormSchema = z.object({
  questionText: z.string().trim().min(1, "Question text is required."),
  questionType: z.enum(questionTypes),
  bank: z.string().optional(),
  ownerTopicId: z.string().trim().min(1, "Owner topic is required."),
  points: z
    .string()
    .trim()
    .refine((value) => value.length > 0, "Points are required.")
    .refine((value) => !Number.isNaN(Number(value)), "Points must be a valid number.")
    .refine((value) => Number(value) > 0, "Points must be greater than zero."),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  options: z.any().optional(),
  correctAnswers: z.any().optional(),
});

export type QuestionFormSchemaData = z.infer<typeof questionFormSchema>;
