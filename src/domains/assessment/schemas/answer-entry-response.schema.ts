import z from "zod";

export const singleResponseSchema = z.object({
  type: z.literal("single"),
  selected_option_id: z.string(),
});

export const multipleResponseSchema = z.object({
  type: z.literal("multiple"),
  selected_option_ids: z.array(z.string()),
});

export const answerEntryResponseSchema = z.union([
  singleResponseSchema,
  multipleResponseSchema,
]);

