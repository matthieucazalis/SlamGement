import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { roleLabel } from "@/lib/labels";
import { requireUser } from "@/lib/session";
import {
  EmailMismatchError,
  InvalidInvitationError,
  acceptInvitation,
  getInvitationByToken,
} from "@/services/invitation.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const t = await getT();
  const invitation = await getInvitationByToken(token);
  const session = await auth();

  async function accept() {
    "use server";
    const user = await requireUser();
    let projectId: string;
    try {
      projectId = await acceptInvitation(user.id, user.email ?? "", token);
    } catch (e) {
      if (e instanceof InvalidInvitationError)
        redirect(`/invite/${token}?error=invalid`);
      if (e instanceof EmailMismatchError)
        redirect(`/invite/${token}?error=email`);
      throw e;
    }
    redirect(`/projects/${projectId}`);
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center p-4"
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("invite.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!invitation ? (
            <p>{t("invite.invalidLink")}</p>
          ) : (
            <>
              <p>
                {t("invite.introBefore")}{" "}
                <strong>{invitation.project.name}</strong>{" "}
                {t("invite.introMiddle")}{" "}
                <strong>{roleLabel(t, invitation.role)}</strong>.
              </p>

              {error === "email" && (
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {t("invite.errorEmail", { email: invitation.email })}
                </p>
              )}
              {error === "invalid" && (
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {t("invite.errorInvalid")}
                </p>
              )}

              {session?.user ? (
                <form action={accept}>
                  <Button type="submit" className="w-full">
                    {t("invite.join")}
                  </Button>
                </form>
              ) : (
                <p className="text-sm">
                  {t("invite.loginBefore")} <strong>{invitation.email}</strong>
                  {t("invite.loginAfter")}
                  <br />
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
                    className="underline"
                  >
                    {t("invite.login")}
                  </Link>
                  {" · "}
                  <Link
                    href={`/register?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
                    className="underline"
                  >
                    {t("invite.register")}
                  </Link>
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
