import Link from "next/link";
import { notFound } from "next/navigation";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { getProjectForUser } from "@/services/project.service";
import { createAdrAction } from "../actions";
import { AdrForm } from "../adr-form";

export default async function NewAdrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  try {
    await getProjectForUser(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Link href={`/projects/${id}/adr`} className="text-sm underline">
        ← Les ADR
      </Link>
      <h1 className="text-2xl font-bold">Nouvel ADR</h1>
      <AdrForm
        action={createAdrAction.bind(null, id)}
        submitLabel="Créer l'ADR"
      />
    </main>
  );
}
