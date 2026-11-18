"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "../../actions";
import { PreferencesBar } from "@/components/preferences-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/client";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(
    resetPasswordAction.bind(null, token),
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
          <CardTitle>{t("auth.resetTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.resetNewPassword")}</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("auth.resetConfirm")}</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
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
              {pending ? t("auth.resetSaving") : t("auth.resetSubmit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
