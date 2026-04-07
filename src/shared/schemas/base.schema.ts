import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const timestampSchema = z.string().datetime();
