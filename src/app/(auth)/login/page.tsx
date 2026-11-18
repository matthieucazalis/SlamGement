import { getT } from "@/i18n/server";
import { safeCallbackPath } from "@/lib/safe-redirect";
import { LoginForm } from "./login-form";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("auth.login") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    registered?: string;
    deleted?: string;
    reset?: string;
    callbackUrl?: string;
  }>;
}) {
  const { registered, deleted, reset, callbackUrl } = await searchParams;
  // valeur déjà nettoyée côté serveur ; elle est revérifiée à la connexion
  const safe = callbackUrl ? safeCallbackPath(callbackUrl, "") : "";

  return (
    <LoginForm
      registered={registered === "1"}
      deleted={deleted === "1"}
      reset={reset === "1"}
      callbackUrl={safe || undefined}
    />
  );
}
