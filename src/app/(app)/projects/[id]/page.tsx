import Link from "next/link";
import { notFound } from "next/navigation";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { getProjectForUser } from "@/services/project.service";

export default async function ProjectPage({
  params,
}: {
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
    <main className="mx-auto max-w-2xl space-y-4 p-8">
      <Link href="/projects" className="text-sm underline">
        ← Mes projets
      </Link>
      <h1 className="text-2xl font-bold">{data.project.name}</h1>
      {data.project.description && <p>{data.project.description}</p>}
      <p className="text-sm">Ton rôle : {data.role}</p>
    </main>
  );
}
