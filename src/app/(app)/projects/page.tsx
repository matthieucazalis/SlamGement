import Link from "next/link";
import { signOut } from "@/lib/auth";
import { requireUser } from "@/lib/session";
import { listProjectsForUser } from "@/services/project.service";
import { Button } from "@/components/ui/button";
import { NewProjectForm } from "./new-project-form";

export default async function ProjectsPage() {
  const user = await requireUser();
  const memberships = await listProjectsForUser(user.id);

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes projets</h1>
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-sm underline">
            Mon profil
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Se déconnecter
            </Button>
          </form>
        </div>
      </div>

      {memberships.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun projet pour l'instant. Crée le premier ci-dessous.
        </p>
      ) : (
        <ul className="space-y-2">
          {memberships.map(({ project, role }) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted"
              >
                <span className="font-medium">{project.name}</span>
                <span className="text-xs uppercase">{role}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <NewProjectForm />
    </main>
  );
}
