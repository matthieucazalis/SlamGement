import Link from "next/link";
import { notFound } from "next/navigation";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { getProjectForUser } from "@/services/project.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteProjectAction } from "./actions";

const ERRORS: Record<string, string> = {
  confirm: "Le nom saisi ne correspond pas : le projet n'a pas été supprimé.",
  forbidden: "Action réservée aux administrateurs.",
};

export default async function ProjectPage({
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
  try {
    data = await getProjectForUser(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  const isAdmin = data.role === "ADMIN";

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Link href="/projects" className="text-sm underline">
        ← Mes projets
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{data.project.name}</h1>
        {data.project.description && <p>{data.project.description}</p>}
        <p className="text-sm">Ton rôle : {data.role}</p>
      </div>

      <nav className="flex gap-4 text-sm">
        <Link href={`/projects/${id}/members`} className="underline">
          Membres
        </Link>
        <Link href={`/projects/${id}/adr`} className="underline">
          Décisions (ADR)
        </Link>
      </nav>

      {error && ERRORS[error] && (
        <p
          className="rounded-md border border-red-300 p-3 text-sm text-red-600"
          role="alert"
        >
          {ERRORS[error]}
        </p>
      )}

      {isAdmin && (
        <section className="space-y-3 rounded-lg border border-red-300 p-4">
          <h2 className="font-semibold text-red-600">Zone dangereuse</h2>
          <p className="text-sm">
            Supprimer le projet efface définitivement ses membres, ses
            invitations et ses décisions. Cette action est irréversible.
          </p>
          <form
            action={deleteProjectAction.bind(null, id)}
            className="space-y-3"
          >
            <div className="space-y-2">
              <Label htmlFor="confirmName">
                Tape <strong>{data.project.name}</strong> pour confirmer
              </Label>
              <Input
                id="confirmName"
                name="confirmName"
                autoComplete="off"
                required
              />
            </div>
            <Button type="submit" variant="destructive">
              Supprimer définitivement
            </Button>
          </form>
        </section>
      )}
    </main>
  );
}
