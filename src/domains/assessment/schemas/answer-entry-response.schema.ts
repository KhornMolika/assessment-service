import z from "zod";

const singleResponseSchema = z.object({
  type: z.literal("single"),
  selected_option_id: z.string()
});

const multipleResponseSchema = z.object({
  type: z.literal("multiple"),
  selected_option_ids: z.array(z.string())
});

