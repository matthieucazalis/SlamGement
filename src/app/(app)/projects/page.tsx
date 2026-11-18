import Link from "next/link";
import { getT } from "@/i18n/server";
import { roleLabel } from "@/lib/labels";
import { requireUser } from "@/lib/session";
import { listProjectsForUser } from "@/services/project.service";
import { NewProjectForm } from "./new-project-form";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("projects.title") };
}

export default async function ProjectsPage() {
  const [user, t] = await Promise.all([requireUser(), getT()]);
  const memberships = await listProjectsForUser(user.id);

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      <h1 className="text-2xl font-bold">{t("projects.title")}</h1>

      {memberships.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("projects.empty")}</p>
      ) : (
        <ul className="space-y-2">
          {memberships.map(({ project, role }) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted"
              >
                <span className="font-medium">{project.name}</span>
                <span className="text-xs">{roleLabel(t, role)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <NewProjectForm />
    </main>
  );
}
