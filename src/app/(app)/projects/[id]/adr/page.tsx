import Link from "next/link";
import { notFound } from "next/navigation";
import { AdrStatusBadge } from "@/components/adr-status-badge";
import {
  ADR_STATUSES,
  STATUS_LABELS,
  type AdrStatusValue,
} from "@/lib/adr-status";
import { formatAdrNumber } from "@/lib/adr-format";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { listAdrs } from "@/services/adr.service";
import { getProjectForUser } from "@/services/project.service";

export default async function AdrListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const user = await requireUser();

  const filter = ADR_STATUSES.find((s) => s === status) as
    | AdrStatusValue
    | undefined;

  let project;
  let adrs;
  try {
    ({ project } = await getProjectForUser(user.id, id));
    adrs = await listAdrs(user.id, id, filter);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  const pill = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active ? "bg-muted font-medium" : ""}`;

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <Link href={`/projects/${id}`} className="text-sm underline">
        ← {project.name}
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Décisions d'architecture</h1>
        <div className="flex items-center gap-2">
          <a
            href={`/projects/${id}/adr/export`}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Tout exporter (ZIP)
          </a>
          <Link
            href={`/projects/${id}/adr/new`}
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            Nouvel ADR
          </Link>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par statut">
        <Link href={`/projects/${id}/adr`} className={pill(!filter)}>
          Tous
        </Link>
        {ADR_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/projects/${id}/adr?status=${s}`}
            className={pill(filter === s)}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </nav>

      {adrs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {filter ? "Aucun ADR avec ce statut." : "Aucun ADR pour l'instant."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left">
              <tr>
                <th className="p-3">N°</th>
                <th className="p-3">Titre</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Auteur</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {adrs.map((adr) => (
                <tr key={adr.id}>
                  <td className="p-3 font-mono">
                    {formatAdrNumber(adr.number)}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/projects/${id}/adr/${adr.number}`}
                      className="underline"
                    >
                      {adr.title}
                    </Link>
                  </td>
                  <td className="p-3">
                    <AdrStatusBadge status={adr.status} />
                  </td>
                  <td className="p-3">{adr.author.name}</td>
                  <td className="p-3">
                    {adr.createdAt.toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
