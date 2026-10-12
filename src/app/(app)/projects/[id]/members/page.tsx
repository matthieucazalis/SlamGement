import Link from "next/link";
import { notFound } from "next/navigation";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { listMembers } from "@/services/member.service";
import { getProjectForUser } from "@/services/project.service";
import { Button } from "@/components/ui/button";
import { changeRoleAction, removeMemberAction } from "./actions";
import { InviteForm } from "./invite-form";

const ERRORS: Record<string, string> = {
  "last-admin":
    "Impossible : le projet doit garder au moins un administrateur.",
  forbidden: "Action non autorisée.",
  invalid: "Données invalides.",
};

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await requireUser();

  let data;
  let members;
  try {
    data = await getProjectForUser(user.id, id);
    members = await listMembers(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  const isAdmin = data.role === "ADMIN";

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Link href={`/projects/${id}`} className="text-sm underline">
        ← {data.project.name}
      </Link>
      <h1 className="text-2xl font-bold">Membres</h1>

      {error && ERRORS[error] && (
        <p
          className="rounded-md border border-red-300 p-3 text-sm text-red-600"
          role="alert"
        >
          {ERRORS[error]}
        </p>
      )}

      <ul className="divide-y rounded-lg border">
        {members.map((m) => {
          const isSelf = m.userId === user.id;
          return (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3"
            >
              <div>
                <p className="font-medium">
                  {m.user.name}{" "}
                  {isSelf && <span className="text-xs">(toi)</span>}
                </p>
                <p className="text-sm text-muted-foreground">{m.user.email}</p>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <form
                    action={changeRoleAction.bind(null, id, m.id)}
                    className="flex items-center gap-2"
                  >
                    <select
                      name="role"
                      defaultValue={m.role}
                      aria-label={`Rôle de ${m.user.name}`}
                      className="h-8 rounded-md border bg-transparent px-2 text-sm"
                    >
                      <option value="MEMBER">Membre</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                    <Button type="submit" variant="outline" size="sm">
                      Appliquer
                    </Button>
                  </form>
                ) : (
                  <span className="text-xs uppercase">{m.role}</span>
                )}

                {(isAdmin || isSelf) && (
                  <form action={removeMemberAction.bind(null, id, m.id)}>
                    <Button type="submit" variant="destructive" size="sm">
                      {isSelf ? "Quitter" : "Retirer"}
                    </Button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {isAdmin && <InviteForm projectId={id} />}
    </main>
  );
}
