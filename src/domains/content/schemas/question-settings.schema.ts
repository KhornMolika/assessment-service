import z from "zod";

const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const singleSettingsSchema = z.object({
  type: z.literal("single"),
  options: z.array(optionSchema),
  shuffle: z.boolean().optional(),
});

export const multipleSettingsSchema = z.object({
  type: z.literal("multiple"),
  options: z.array(optionSchema),
  min_select: z.number().optional(),
  max_select: z.number().optional(),
});

export const questionSettingsSchema = z.union([
  singleSettingsSchema,
  multipleSettingsSchema,
]);

