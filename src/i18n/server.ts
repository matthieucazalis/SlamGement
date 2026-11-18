import { cache } from "react";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_THEME,
  HAPTICS_COOKIE,
  LOCALE_COOKIE,
  THEME_COOKIE,
  isLocale,
  isTheme,
  matchLocale,
  type Locale,
  type Theme,
} from "./config";
import { createTranslator, type Translator } from "./translate";

export type Preferences = {
  locale: Locale;
  theme: Theme;
  haptics: boolean;
};

// Préférences enregistrées sur le compte (utilisées quand le cookie est absent :
// nouvel appareil, cookies effacés…)
const accountPreferences = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { locale: true, theme: true, haptics: true },
  });
});

// Ordre de priorité : cookie → compte → langue du navigateur → français.
export const getPreferences = cache(async (): Promise<Preferences> => {
  const jar = await cookies();
  const cookieLocale = jar.get(LOCALE_COOKIE)?.value;
  const cookieTheme = jar.get(THEME_COOKIE)?.value;
  const cookieHaptics = jar.get(HAPTICS_COOKIE)?.value;

  let account: Awaited<ReturnType<typeof accountPreferences>> = null;
  if (!cookieLocale || !cookieTheme || cookieHaptics === undefined)
    account = await accountPreferences();

  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : isLocale(account?.locale)
      ? account.locale
      : matchLocale((await headers()).get("accept-language"));

  const theme = isTheme(cookieTheme)
    ? cookieTheme
    : isTheme(account?.theme)
      ? account.theme
      : DEFAULT_THEME;

  const haptics =
    cookieHaptics !== undefined
      ? cookieHaptics === "1"
      : (account?.haptics ?? true);

  return { locale, theme, haptics };
});

export async function getLocale(): Promise<Locale> {
  return (await getPreferences()).locale;
}

export async function getT(): Promise<Translator> {
  return createTranslator(await getLocale());
}
