import { DEFAULT_LOCALE, type Locale } from "./config";
import { messages, type Messages } from "./messages";

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;
export type Params = Record<string, string | number>;
export type Translator = (key: MessageKey, params?: Params) => string;

function lookup(tree: unknown, key: string): string | undefined {
  let node = tree;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node)
      node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === "string" ? node : undefined;
}

// Pluriel : « une tâche|{count} tâches ». En français, 0 et 1 sont au singulier.
function pickPlural(message: string, count: number, locale: Locale) {
  if (!message.includes("|")) return message;
  const [singular, plural] = message.split("|");
  const isSingular = locale === "fr" ? count >= 0 && count < 2 : count === 1;
  return isSingular ? singular : plural;
}

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Params,
): string {
  const raw =
    lookup(messages[locale], key) ??
    lookup(messages[DEFAULT_LOCALE], key) ??
    key;
  const withPlural =
    typeof params?.count === "number"
      ? pickPlural(raw, params.count, locale)
      : raw;
  if (!params) return withPlural;
  return withPlural.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function createTranslator(locale: Locale): Translator {
  return (key, params) => translate(locale, key, params);
}
