import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Invitation SlamGement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!invitation ? (
            <p>Ce lien d'invitation est invalide ou a expiré.</p>
          ) : (
            <>
              <p>
                Tu es invité(e) à rejoindre le projet{" "}
                <strong>{invitation.project.name}</strong> avec le rôle{" "}
                <strong>{invitation.role}</strong>.
              </p>

              {error === "email" && (
                <p className="text-sm text-red-600" role="alert">
                  Cette invitation est destinée à {invitation.email}.
                  Connecte-toi avec ce compte.
                </p>
              )}
              {error === "invalid" && (
                <p className="text-sm text-red-600" role="alert">
                  Cette invitation n'est plus valable.
                </p>
              )}

              {session?.user ? (
                <form action={accept}>
                  <Button type="submit" className="w-full">
                    Rejoindre le projet
                  </Button>
                </form>
              ) : (
                <p className="text-sm">
                  Connecte-toi ou crée un compte avec l'adresse{" "}
                  <strong>{invitation.email}</strong>, puis rouvre ce lien.
                  <br />
                  <Link href="/login" className="underline">
                    Connexion
                  </Link>
                  {" · "}
                  <Link href="/register" className="underline">
                    Inscription
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
