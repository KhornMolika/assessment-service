import { z } from "zod";
import type { QuestionFormType } from "@/src/domains/content/types/question-form.types";

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
  "File Upload",
] as const satisfies readonly QuestionFormType[];

export const questionFormSchema = z
  .object({
    questionText: z.string().trim().min(1, "Question text is required."),
    questionType: z.enum(questionTypes),
    bank: z.string(),
    ownerTopicId: z.string().trim().min(1, "Owner topic is required."),
    topicIds: z.array(z.string()).min(1, "Select at least one topic."),
    points: z
      .string()
      .trim()
      .refine((value) => value.length > 0, "Points are required.")
      .refine((value) => !Number.isNaN(Number(value)), "Points must be a valid number.")
      .refine((value) => Number(value) > 0, "Points must be greater than zero."),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    language: z.enum(["English (EN)", "Khmer (KH)"]),
    tags: z.string(),
    explanation: z.string(),
    mediaUrl: z
      .string()
      .refine(
        (value) => value.trim().length === 0 || /^https?:\/\//.test(value.trim()),
        "Media URL must start with http:// or https://.",
      ),
    options: z.array(z.string()),
    correctAnswers: z.array(z.number().int().nonnegative()),
    trueFalseAnswer: z.boolean(),
    shortAnswerKeywords: z.array(z.string()),
    fillInBlankText: z.string(),
    fillInBlankAnswers: z.array(z.string()),
    matchingPairs: z.array(
      z.object({
        left: z.string(),
        right: z.string(),
      }),
    ),
    orderItems: z.array(z.string()),
    ratingScale: z.number().int().positive(),
    ratingLabels: z.object({
      min: z.string(),
      max: z.string(),
    }),
    fileUploadTypes: z.array(z.string()),
    fileUploadMaxSize: z.number().positive(),
    fileUploadMaxFiles: z.number().int().positive(),
    fileUploadInstructions: z.string(),
    aiScoring: z.boolean(),
    aiGradingMode: z.enum(["default", "custom"]),
    manualModeration: z.boolean(),
    rubric: z.string(),
  })
  .superRefine((data, ctx) => {
    const trimmedOptions = data.options.map((option) => option.trim());
    const filledOptions = trimmedOptions.filter(Boolean);
    const trimmedKeywords = data.shortAnswerKeywords.map((keyword) => keyword.trim()).filter(Boolean);
    const trimmedBlankAnswers = data.fillInBlankAnswers.map((answer) => answer.trim()).filter(Boolean);
    const filledPairs = data.matchingPairs.filter(
      (pair) => pair.left.trim().length > 0 && pair.right.trim().length > 0,
    );
    const filledOrderItems = data.orderItems.map((item) => item.trim()).filter(Boolean);

    if (!data.topicIds.includes(data.ownerTopicId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["topicIds"],
        message: "The owner topic must also be part of the assigned topics.",
      });
    }

    switch (data.questionType) {
      case "Single Choice":
      case "Multiple Choices": {
        if (filledOptions.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["options"],
            message: "Provide at least two answer options.",
          });
        }

        if (data.correctAnswers.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["correctAnswers"],
            message: "Select at least one correct answer.",
          });
        }

        if (data.questionType === "Single Choice" && data.correctAnswers.length !== 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["correctAnswers"],
            message: "Single choice questions must have exactly one correct answer.",
          });
        }

        const hasInvalidCorrectAnswer = data.correctAnswers.some(
          (index) => !trimmedOptions[index] || index < 0,
        );

        if (hasInvalidCorrectAnswer) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["correctAnswers"],
            message: "Correct answers must point to filled answer options.",
          });
        }
        break;
      }

      case "Short Answer":
        if (trimmedKeywords.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["shortAnswerKeywords"],
            message: "Provide at least one acceptable keyword or answer.",
          });
        }
        break;

      case "Fill in the Blank": {
        const blankCount = (data.fillInBlankText.match(/_____+/g) ?? []).length;

        if (blankCount === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["fillInBlankText"],
            message: "Use at least one blank marker like _____ in the text.",
          });
        }

        if (trimmedBlankAnswers.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["fillInBlankAnswers"],
            message: "Provide at least one correct answer for the blanks.",
          });
        }

        if (blankCount > 0 && trimmedBlankAnswers.length !== blankCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["fillInBlankAnswers"],
            message: "The number of blank answers must match the number of blanks.",
          });
        }
        break;
      }

      case "Matching":
        if (filledPairs.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["matchingPairs"],
            message: "Provide at least two complete matching pairs.",
          });
        }
        break;

      case "Ordering":
        if (filledOrderItems.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["orderItems"],
            message: "Provide at least two items to order.",
          });
        }
        break;

      case "Rating Scale":
        if (data.ratingLabels.min.trim().length === 0 || data.ratingLabels.max.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["ratingLabels"],
            message: "Provide both minimum and maximum rating labels.",
          });
        }
        break;

      case "File Upload":
        if (data.fileUploadTypes.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["fileUploadTypes"],
            message: "Select at least one allowed file type.",
          });
        }
        break;

      default:
        break;
    }
  });

export type QuestionFormSchemaData = z.infer<typeof questionFormSchema>;
