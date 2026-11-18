"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { applyTheme } from "@/components/theme-sync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePreferencesAction } from "@/i18n/actions";
import { useT } from "@/i18n/client";
import {
  LOCALES,
  LOCALE_NAMES,
  THEMES,
  type Locale,
  type Theme,
} from "@/i18n/config";
import type { MessageKey } from "@/i18n/translate";

const THEME_KEYS: Record<Theme, MessageKey> = {
  light: "settings.themeLight",
  dark: "settings.themeDark",
  system: "settings.themeSystem",
};

function Choice({
  name,
  value,
  checked,
  label,
  onChange,
}: {
  name: string;
  value: string;
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
        checked ? "border-primary bg-muted font-medium" : ""
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="accent-primary"
      />
      {label}
    </label>
  );
}

export function PreferencesForm(initial: {
  locale: Locale;
  theme: Theme;
  haptics: boolean;
}) {
  const router = useRouter();
  const t = useT();
  const [locale, setLocale] = useState(initial.locale);
  const [theme, setTheme] = useState(initial.theme);
  const [haptics, setHaptics] = useState(initial.haptics);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const save = (input: {
    locale?: Locale;
    theme?: Theme;
    haptics?: boolean;
  }) => {
    setSaved(false);
    startTransition(async () => {
      const result = await updatePreferencesAction(input);
      setSaved(result.ok);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6" aria-busy={pending}>
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.languageTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("settings.languageHelp")}
          </p>
          <div
            role="radiogroup"
            aria-label={t("settings.languageTitle")}
            className="grid gap-2 sm:grid-cols-3"
          >
            {LOCALES.map((l) => (
              <Choice
                key={l}
                name="locale"
                value={l}
                checked={locale === l}
                label={LOCALE_NAMES[l]}
                onChange={() => {
                  setLocale(l);
                  save({ locale: l });
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.themeTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("settings.themeHelp")}
          </p>
          <div
            role="radiogroup"
            aria-label={t("settings.themeTitle")}
            className="grid gap-2 sm:grid-cols-3"
          >
            {THEMES.map((th) => (
              <Choice
                key={th}
                name="theme"
                value={th}
                checked={theme === th}
                label={t(THEME_KEYS[th])}
                onChange={() => {
                  setTheme(th);
                  applyTheme(th); // effet immédiat, sans attendre le serveur
                  save({ theme: th });
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.hapticsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("settings.hapticsHelp")}
          </p>
          <div
            role="radiogroup"
            aria-label={t("settings.hapticsTitle")}
            className="grid gap-2 sm:grid-cols-3"
          >
            <Choice
              name="haptics"
              value="on"
              checked={haptics}
              label={t("settings.hapticsOn")}
              onChange={() => {
                setHaptics(true);
                save({ haptics: true });
              }}
            />
            <Choice
              name="haptics"
              value="off"
              checked={!haptics}
              label={t("settings.hapticsOff")}
              onChange={() => {
                setHaptics(false);
                save({ haptics: false });
              }}
            />
          </div>
        </CardContent>
      </Card>

      <p
        className="min-h-5 text-sm text-green-600 dark:text-green-400"
        role="status"
      >
        {saved ? t("settings.saved") : ""}
      </p>
    </div>
  );
}
