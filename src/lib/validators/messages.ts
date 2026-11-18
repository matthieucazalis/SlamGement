import type { ZodError } from "zod";
import type { MessageKey, Translator } from "@/i18n/translate";
import { messages } from "@/i18n/messages";

// Les schémas Zod renvoient des clés de traduction comme messages d'erreur.
// Les erreurs sans message personnalisé (ex. une longueur maximale) retombent
// sur un message générique plutôt que sur l'anglais de Zod.
function isMessageKey(value: string): value is MessageKey {
  const [domain, key] = value.split(".");
  return (
    domain === "validation" &&
    key !== undefined &&
    key in messages.fr.validation
  );
}

export function firstIssueMessage(t: Translator, error: ZodError): string {
  const message = error.issues[0]?.message ?? "";
  return isMessageKey(message) ? t(message) : t("validation.invalid");
}
