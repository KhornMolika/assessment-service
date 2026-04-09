import z from "zod";

const singleSettingsSchema = z.object({
  type: z.literal("single"),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string()
    })
  ),
  shuffle: z.boolean().optional()
});

const multipleSettingsSchema = z.object({
  type: z.literal("multiple"),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string()
    })
  ),
  min_select: z.number().optional(),
  max_select: z.number().optional()
});

