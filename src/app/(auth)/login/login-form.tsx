"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreferencesBar } from "@/components/preferences-bar";
import { useT } from "@/i18n/client";

export function LoginForm({
  registered,
  deleted,
  reset,
  callbackUrl,
}: {
  registered: boolean;
  deleted: boolean;
  reset: boolean;
  callbackUrl?: string;
}) {
  const t = useT();
  const [state, action, pending] = useActionState(loginAction, undefined);
  const registerHref = callbackUrl
    ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/register";

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-4"
    >
      <PreferencesBar />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.loginTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            {callbackUrl && (
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
            )}
            {registered && (
              <p
                className="text-sm text-green-600 dark:text-green-400"
                role="status"
              >
                {t("auth.registered")}
              </p>
            )}
            {reset && (
              <p
                className="text-sm text-green-600 dark:text-green-400"
                role="status"
              >
                {t("auth.resetDone")}
              </p>
            )}
            {deleted && (
              <p
                className="text-sm text-green-600 dark:text-green-400"
                role="status"
              >
                {t("auth.accountDeleted")}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <p className="text-right text-sm">
              <Link href="/forgot-password" className="underline">
                {t("auth.forgotLink")}
              </Link>
            </p>
            {state?.error && (
              <p
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {state.error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? t("auth.loggingIn") : t("auth.login")}
            </Button>
            <p className="text-center text-sm">
              {t("auth.noAccount")}{" "}
              <Link href={registerHref} className="underline">
                {t("auth.createAccount")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
