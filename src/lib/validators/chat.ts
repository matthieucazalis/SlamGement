import { z } from "zod";
import { hasForbiddenChars } from "@/lib/validators/text";

export const MESSAGE_MAX = 2000;

// Texte brut uniquement : jamais interprété comme HTML, Markdown ou commande.
export const messageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "validation.messageEmpty")
    .max(MESSAGE_MAX, "validation.messageMax")
    .refine((v) => !hasForbiddenChars(v), "validation.forbiddenChars")
    // pas plus de 3 sauts de ligne d'affilée (évite de noyer la discussion)
    .transform((v) => v.replace(/(\r?\n){4,}/g, "\n\n\n")),
});

export type MessageInput = z.infer<typeof messageSchema>;
