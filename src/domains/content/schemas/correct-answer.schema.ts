import { z } from "zod";

const single = z.object({
  type: z.literal("single"),
  correct_option_ids: z.array(z.string())
});

const multiple = z.object({
  type: z.literal("multiple"),
  correct_option_ids: z.array(z.string())
});

const boolean = z.object({
  type: z.literal("boolean"),
  value: z.boolean()
});

const fill = z.object({
  type: z.literal("fill"),
  answers: z.array(z.string())
});

const ordering = z.object({
  type: z.literal("ordering"),
  correct_order: z.array(z.string())
});

const matching = z.object({
  type: z.literal("matching"),
  pairs: z.array(
    z.object({
      left: z.string(),
      right: z.string()
    })
  )
});

export const correctAnswerSchema = z.discriminatedUnion("type", [
  single,
  multiple,
  boolean,
  fill,
  ordering,
  matching
]);