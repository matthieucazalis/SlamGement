import { z } from "zod";
import { isAcceptableMermaid } from "@/lib/mermaid-check";
import { hasForbiddenChars } from "@/lib/validators/text";

// Les messages sont des clés de traduction (voir i18n/messages/validation.ts)
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "validation.max10000")
    .refine((v) => !hasForbiddenChars(v), "validation.forbiddenChars")
    .optional()
    .transform((v) => (v ? v : undefined));

export const adrSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "validation.min3")
    .max(120)
    .refine((v) => !hasForbiddenChars(v), "validation.forbiddenChars"),
  context: z
    .string()
    .trim()
    .min(10, "validation.contextMin")
    .max(10000)
    .refine((v) => !hasForbiddenChars(v), "validation.forbiddenChars"),
  decision: z
    .string()
    .trim()
    .min(10, "validation.decisionMin")
    .max(10000)
    .refine((v) => !hasForbiddenChars(v), "validation.forbiddenChars"),
  consequences: z
    .string()
    .trim()
    .min(10, "validation.consequencesMin")
    .max(10000)
    .refine((v) => !hasForbiddenChars(v), "validation.forbiddenChars"),
  alternatives: optionalText(10000),
  mermaidCode: optionalText(10000).refine(
    (v) => v === undefined || isAcceptableMermaid(v),
    "validation.mermaidInvalid",
  ),
});

export type AdrInput = z.infer<typeof adrSchema>;
