"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updatePreferencesAction } from "@/i18n/actions";
import { useLocale, useT, useTheme } from "@/i18n/client";
import { LOCALES, LOCALE_NAMES, type Locale, type Theme } from "@/i18n/config";
import { applyTheme } from "@/components/theme-sync";

// Raccourcis langue et thème, disponibles partout (y compris avant connexion)
export function PreferencesBar() {
  const router = useRouter();
  const theme = useTheme();
  const locale = useLocale();
  const t = useT();
  const [pending, startTransition] = useTransition();

  const save = (input: { locale?: Locale; theme?: Theme }) =>
    startTransition(async () => {
      await updatePreferencesAction(input);
      router.refresh();
    });

  // En mode « système », on lit le réglage de l'appareil après l'affichage
  // (pas côté serveur) pour que l'icône reste cohérente avec l'écran.
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    if (theme !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [theme]);
  const isDark = theme === "dark" || (theme === "system" && systemDark);
  const nextTheme: Theme = isDark ? "light" : "dark";

  return (
    <div className="flex items-center gap-2" aria-busy={pending}>
      <label className="sr-only" htmlFor="quick-locale">
        {t("common.language")}
      </label>
      <select
        id="quick-locale"
        value={locale}
        disabled={pending}
        onChange={(e) => save({ locale: e.target.value as Locale })}
        className="h-8 rounded-md border bg-transparent px-2 text-sm"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          applyTheme(nextTheme);
          save({ theme: nextTheme });
        }}
        aria-label={`${t("common.theme")} : ${t(nextTheme === "dark" ? "settings.themeDark" : "settings.themeLight")}`}
        title={t(
          nextTheme === "dark" ? "settings.themeDark" : "settings.themeLight",
        )}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-base"
      >
        <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
      </button>
    </div>
  );
}
