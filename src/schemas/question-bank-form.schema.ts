import { z } from "zod";

export const questionBankFormSchema = z.object({
  name: z.string().trim().min(1, "Bank name is required."),
  description: z.string(),
  tags: z.string(),
  visibility: z.enum(["PRIVATE", "ORG", "PUBLIC"]),
  ownerTopicId: z.string().trim().min(1, "Owner topic is required."),
});

export type QuestionBankFormSchemaData = z.infer<typeof questionBankFormSchema>;
