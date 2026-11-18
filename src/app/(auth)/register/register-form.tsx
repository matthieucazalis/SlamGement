"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreferencesBar } from "@/components/preferences-bar";
import { useT } from "@/i18n/client";

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(registerAction, undefined);
  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login";

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-4"
    >
      <PreferencesBar />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.registerTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            {callbackUrl && (
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
            )}
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            </div>
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
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />
              <p className="text-xs text-muted-foreground">
                {t("auth.passwordHint")}
              </p>
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
              {pending ? t("auth.registering") : t("auth.register")}
            </Button>
            <p className="text-center text-sm">
              {t("auth.hasAccount")}{" "}
              <Link href={loginHref} className="underline">
                {t("auth.login")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
