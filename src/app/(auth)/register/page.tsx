import { getT } from "@/i18n/server";
import { safeCallbackPath } from "@/lib/safe-redirect";
import { RegisterForm } from "./register-form";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("auth.registerTitle") };
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safe = callbackUrl ? safeCallbackPath(callbackUrl, "") : "";

  return <RegisterForm callbackUrl={safe || undefined} />;
}
