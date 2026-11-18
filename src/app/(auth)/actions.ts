"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { getLocale, getT } from "@/i18n/server";
import { signIn } from "@/lib/auth";
import { normalizeIp } from "@/lib/rate-limit";
import { safeCallbackPath } from "@/lib/safe-redirect";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validators/auth";
import { firstIssueMessage } from "@/lib/validators/messages";
import {
  InvalidResetTokenError,
  requestPasswordReset,
  resetPassword,
} from "@/services/password-reset.service";
import { maybePurge } from "@/services/maintenance.service";
import { isLoginBlocked } from "@/services/rate-limit.service";
import { EmailTakenError, registerUser } from "@/services/user.service";

export type FormState = { error?: string } | undefined;

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const t = await getT();
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssueMessage(t, parsed.error) };

  try {
    await registerUser(parsed.data);
  } catch (e) {
    if (e instanceof EmailTakenError) return { error: t("errors.emailTaken") };
    throw e;
  }
  const callbackUrl = formData.get("callbackUrl");
  const next = callbackUrl ? safeCallbackPath(callbackUrl, "") : "";
  redirect(
    next
      ? `/login?registered=1&callbackUrl=${encodeURIComponent(next)}`
      : "/login?registered=1",
  );
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const t = await getT();
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: t("errors.invalidCredentials") };

  const ip = normalizeIp((await headers()).get("x-forwarded-for"));
  if (await isLoginBlocked(parsed.data.email, ip))
    return { error: t("errors.tooManyAttempts") };

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeCallbackPath(formData.get("callbackUrl")),
    });
  } catch (e) {
    if (e instanceof AuthError)
      return { error: t("errors.invalidCredentials") };
    throw e;
  }
}

export type ForgotState = { error?: string; sent?: boolean } | undefined;

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssueMessage(t, parsed.error) };

  const ip = normalizeIp((await headers()).get("x-forwarded-for"));
  await requestPasswordReset({
    email: parsed.data.email,
    ip,
    locale,
    baseUrl: await getBaseUrl(),
  });
  maybePurge(); // ménage opportuniste des données expirées

  // même réponse que le compte existe ou non
  return { sent: true };
}

export async function resetPasswordAction(
  token: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const t = await getT();
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssueMessage(t, parsed.error) };

  try {
    await resetPassword(token, parsed.data.password);
  } catch (e) {
    if (e instanceof InvalidResetTokenError)
      return { error: t("auth.resetInvalid") };
    throw e;
  }
  redirect("/login?reset=1");
}
