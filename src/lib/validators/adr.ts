import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max} caractères maximum`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const adrSchema = z.object({
  title: z.string().trim().min(3, "3 caractères minimum").max(120),
  context: z
    .string()
    .trim()
    .min(10, "Contexte : 10 caractères minimum")
    .max(10000),
  decision: z
    .string()
    .trim()
    .min(10, "Décision : 10 caractères minimum")
    .max(10000),
  consequences: z
    .string()
    .trim()
    .min(10, "Conséquences : 10 caractères minimum")
    .max(10000),
  alternatives: optionalText(10000),
  mermaidCode: optionalText(10000),
});

export type AdrInput = z.infer<typeof adrSchema>;
