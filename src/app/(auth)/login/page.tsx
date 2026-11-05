import type { Metadata } from "next";
import { safeCallbackPath } from "@/lib/safe-redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; callbackUrl?: string }>;
}) {
  const { registered, callbackUrl } = await searchParams;
  // valeur déjà nettoyée côté serveur ; elle est revérifiée à la connexion
  const safe = callbackUrl ? safeCallbackPath(callbackUrl, "") : "";

  return (
    <LoginForm
      registered={registered === "1"}
      callbackUrl={safe || undefined}
    />
  );
}
