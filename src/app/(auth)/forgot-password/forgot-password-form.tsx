"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "../actions";
import { PreferencesBar } from "@/components/preferences-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/client";

export function ForgotPasswordForm() {
  const t = useT();
  const [state, action, pending] = useActionState(
    forgotPasswordAction,
    undefined,
  );

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-4"
    >
      <PreferencesBar />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.forgotTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {state?.sent ? (
            <div className="space-y-4">
              <p className="text-sm" role="status">
                {t("auth.forgotSent")}
              </p>
              <Link href="/login" className="text-sm underline">
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("auth.forgotHelp")}
              </p>
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
              {state?.error && (
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {state.error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? t("auth.forgotSending") : t("auth.forgotSubmit")}
              </Button>
              <p className="text-center text-sm">
                <Link href="/login" className="underline">
                  {t("auth.backToLogin")}
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
