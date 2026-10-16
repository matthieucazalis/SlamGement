import Link from "next/link";
import { notFound } from "next/navigation";
import { AdrStatusBadge } from "@/components/adr-status-badge";
import { ADR_STATUSES } from "@/lib/adr-status";
import { describeAudit } from "@/lib/audit-labels";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { getDashboard } from "@/services/dashboard.service";
import { getProjectForUser } from "@/services/project.service";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  let project;
  let data;
  try {
    ({ project } = await getProjectForUser(user.id, id));
    data = await getDashboard(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-8">
      <Link href={`/projects/${id}`} className="text-sm underline">
        ← {project.name}
      </Link>
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Décisions (ADR)" value={data.totalAdrs} />
        <Stat label="Membres" value={data.memberCount} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">ADR par statut</h2>
        {data.totalAdrs === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun ADR pour l'instant.
          </p>
        ) : (
          <ul className="space-y-2">
            {ADR_STATUSES.map((s) => {
              const count = data.byStatus[s];
              const percent = Math.round((count / data.totalAdrs) * 100);
              return (
                <li key={s} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <AdrStatusBadge status={s} />
                  </div>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm tabular-nums">
                    {count} ({percent} %)
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Activité récente</h2>
          {data.isAdmin && (
            <Link
              href={`/projects/${id}/history`}
              className="text-sm underline"
            >
              Tout l'historique
            </Link>
          )}
        </div>
        {data.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune activité.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {data.recent.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap justify-between gap-2 p-3 text-sm"
              >
                <span>
                  <strong>{log.user.name}</strong>{" "}
                  {describeAudit(log.action, log.metadata)}
                </span>
                <span className="text-muted-foreground">
                  {log.createdAt.toLocaleString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
