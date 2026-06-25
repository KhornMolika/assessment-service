import { z } from "zod";

export const assessmentFormSchema = z
  .object({
    name: z.string().max(512, "Name cannot exceed 512 characters."),
    type: z.enum(["QUIZ", "EXAM", "SURVEY", "PRACTICE"]),
    description: z.string().max(1000, "Description cannot exceed 1000 characters."),
    ownerTopicId: z.string().trim().min(1, "Owner topic is required."),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    participantIdentity: z.enum(["ANONYMOUS", "AUTHENTICATED", "EXTERNAL"]),
    sessionMode: z.enum(["SELF_PACED", "REAL_TIME"]),
    questionSelection: z.enum(["MANUAL", "DYNAMIC"]),
    selectedBankId: z.string(),
    selectedQuestionIds: z.array(z.string()),
    initialQuestionIds: z.array(z.string()).default([]),
    totalQuestions: z.number().int(),
    selectionRules: z.array(
      z.object({
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
        count: z.number().int(),
      }),
    ),
    enableTimeLimit: z.boolean(),
    timeLimitMinutes: z.number().int().nonnegative().max(1440, "Time limit cannot exceed 24 hours (1440 mins)."),
    startsAt: z.string(),
    endsAt: z.string(),
    passMark: z.number().min(0, "Pass mark cannot be below 0.").max(100, "Pass mark cannot be above 100."),
    shuffleQuestions: z.boolean(),
    gradeLabels: z.array(
      z.object({
        grade: z.string(),
        minPercent: z.number().min(0).max(100),
      }),
    ),
    showResults: z.enum(["IMMEDIATELY", "MANUAL", "NEVER"]),
  })
  .superRefine((data, ctx) => {
    if (data.name.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Assessment name is required.",
      });
    }

    if (data.questionSelection === "MANUAL" && data.selectedQuestionIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedQuestionIds"],
        message: "Select at least one question for manual question selection.",
      });
    }

    if (data.questionSelection === "DYNAMIC") {
      if (data.selectedBankId.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["selectedBankId"],
          message: "Choose a question bank for dynamic question selection.",
        });
      }

      if (data.totalQuestions <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["totalQuestions"],
          message: "Total questions must be greater than zero.",
        });
      }

      const totalRuleCount = data.selectionRules.reduce((sum, rule) => sum + rule.count, 0);

      if (totalRuleCount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["selectionRules"],
          message: "Add at least one question across the difficulty rules.",
        });
      }

      if (data.totalQuestions > 0 && totalRuleCount !== data.totalQuestions) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["selectionRules"],
          message: "The difficulty rule totals must match the total question count.",
        });
      }
    }

    if (data.enableTimeLimit && data.timeLimitMinutes <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["timeLimitMinutes"],
        message: "Time limit must be greater than zero when timing is enabled.",
      });
    }

    if (data.startsAt && data.endsAt) {
      const start = new Date(data.startsAt).getTime();
      const end = new Date(data.endsAt).getTime();

      if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endsAt"],
          message: "End time must be after the start time.",
        });
      }
    }

    if (data.gradeLabels.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gradeLabels"],
        message: "Add at least one grade label.",
      });
    }

    const emptyGradeLabel = data.gradeLabels.find((label) => label.grade.trim().length === 0);
    if (emptyGradeLabel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gradeLabels"],
        message: "Every grade label needs a non-empty grade name.",
      });
    }

    const minPercents = data.gradeLabels.map(l => l.minPercent);
    const uniquePercents = new Set(minPercents);
    if (uniquePercents.size !== minPercents.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gradeLabels"],
        message: "Grade labels must have unique minimum percentages.",
      });
    }
  });

export type AssessmentFormSchemaData = z.infer<typeof assessmentFormSchema>;
