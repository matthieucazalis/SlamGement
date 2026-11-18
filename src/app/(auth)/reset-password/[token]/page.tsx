import Link from "next/link";
import { getT } from "@/i18n/server";
import { isResetTokenValid } from "@/services/password-reset.service";
import { PreferencesBar } from "@/components/preferences-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("auth.resetTitle") };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [t, valid] = await Promise.all([getT(), isResetTokenValid(token)]);

  if (valid) return <ResetPasswordForm token={token} />;

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
        <CardContent className="space-y-4">
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {t("auth.resetInvalid")}
          </p>
          <Link href="/forgot-password" className="text-sm underline">
            {t("auth.resetRequestNew")}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
