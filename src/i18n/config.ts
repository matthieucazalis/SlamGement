export const LOCALES = ["fr", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "locale";

// Nom de chaque langue écrit dans sa propre langue (jamais traduit)
export const LOCALE_NAMES: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
};

// Code BCP 47 utilisé pour formater dates et nombres
export const LOCALE_TAGS: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  de: "de-DE",
};

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "light";
export const THEME_COOKIE = "theme";
export const HAPTICS_COOKIE = "haptics";

// Les préférences durent un an
export const PREFERENCE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

export function isTheme(value: unknown): value is Theme {
  return (
    typeof value === "string" && (THEMES as readonly string[]).includes(value)
  );
}

// Choisit la meilleure langue à partir de l'en-tête Accept-Language
// (ex. « de-DE,de;q=0.9,en;q=0.8 »). Repli sur la langue par défaut.
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const weight = q ? Number(q.trim().slice(2)) : 1;
      return { lang: tag.trim().toLowerCase().split("-")[0], weight };
    })
    .filter((c) => c.lang && !Number.isNaN(c.weight))
    .sort((a, b) => b.weight - a.weight);

  for (const { lang } of candidates) if (isLocale(lang)) return lang;
  return DEFAULT_LOCALE;
}
