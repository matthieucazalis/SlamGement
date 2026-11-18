import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(2, "validation.min2").max(80),
  description: z
    .string()
    .trim()
    .max(500, "validation.max500")
    .optional()
    .transform((v) => (v ? v : undefined)),
});
