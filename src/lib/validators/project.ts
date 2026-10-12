import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(2, "2 caractères minimum").max(80),
  description: z
    .string()
    .trim()
    .max(500, "500 caractères maximum")
    .optional()
    .transform((v) => (v ? v : undefined)),
});
