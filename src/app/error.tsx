"use client";

import { useT } from "@/i18n/client";

// Page d'erreur propre en dernier recours : aucun détail technique affiché.
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  return (
    <main className="mx-auto max-w-md space-y-4 p-8 text-center">
      <h1 className="text-xl font-bold">{t("errors.pageTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("errors.pageText")}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md border px-3 py-1.5 text-sm"
      >
        {t("errors.retry")}
      </button>
    </main>
  );
}
