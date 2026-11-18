"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale, Theme } from "./config";
import type { Messages } from "./messages";
import { translate, type MessageKey, type Params } from "./translate";

type Value = { locale: Locale; haptics: boolean; theme: Theme };

const I18nContext = createContext<Value | null>(null);

export function I18nProvider({
  locale,
  haptics,
  theme,
  children,
}: {
  locale: Locale;
  haptics: boolean;
  theme: Theme;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, haptics, theme }),
    [locale, haptics, theme],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT doit être utilisé dans <I18nProvider>");
  return ctx;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useTheme(): Theme {
  return useI18n().theme;
}

export function useHapticsEnabled(): boolean {
  return useI18n().haptics;
}

export function useT() {
  const { locale } = useI18n();
  return useMemo(
    () => (key: MessageKey, params?: Params) => translate(locale, key, params),
    [locale],
  );
}

export type { Messages };
