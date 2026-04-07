import { z } from "zod";

export const answerOptionSchema = z.object ({
    id: z.string(),
    question_is: z.string(),
    option_text: z.string(),
    option_order:z.int()
})