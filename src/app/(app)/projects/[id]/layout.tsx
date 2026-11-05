import Link from "next/link";
import { notFound } from "next/navigation";
import { ForbiddenError } from "@/lib/permissions";
import { roleLabel } from "@/lib/roles";
import { requireUser } from "@/lib/session";
import { getProjectForUser } from "@/services/project.service";
import { ProjectNav } from "./project-nav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  let data;
  try {
    data = await getProjectForUser(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  return (
    <div>
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/projects" className="shrink-0 text-sm underline">
              Mes projets
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate font-semibold">{data.project.name}</span>
          </div>
          <span className="shrink-0 text-xs">{roleLabel(data.role)}</span>
        </div>
        <ProjectNav projectId={id} isAdmin={data.role === "ADMIN"} />
      </header>
      {children}
    </div>
  );
}
