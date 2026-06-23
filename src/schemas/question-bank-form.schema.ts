import { z } from "zod";

export const questionBankFormSchema = z.object({
  name: z.string().trim().min(1, "Bank name is required."),
  description: z.string(),
  tags: z.string(),
  visibility: z.enum(["PRIVATE", "SHARED", "PUBLIC"]),
});

export type QuestionBankFormSchemaData = z.infer<typeof questionBankFormSchema>;
