import type { Metadata } from "next";
import { safeCallbackPath } from "@/lib/safe-redirect";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Inscription" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safe = callbackUrl ? safeCallbackPath(callbackUrl, "") : "";

  return <RegisterForm callbackUrl={safe || undefined} />;
}
