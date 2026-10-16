import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AUDIT_ACTION_LABELS, describeAudit } from "@/lib/audit-labels";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { listAuditActors, listAuditLogs } from "@/services/audit.service";
import { getProjectForUser } from "@/services/project.service";
import { Button } from "@/components/ui/button";

const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

const querySchema = z.object({
  user: z.string().max(40).optional().catch(undefined),
  action: z
    .enum(Object.keys(AUDIT_ACTION_LABELS) as [string, ...string[]])
    .optional()
    .catch(undefined),
  from: dateField,
  to: dateField,
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});

function parseDay(value: string | undefined, plusDays = 0) {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setDate(d.getDate() + plusDays);
  return d;
}

const FIELD_CLASS = "h-9 w-full rounded-md border bg-transparent px-2 text-sm";

export default async function HistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const q = querySchema.parse(await searchParams);
  const user = await requireUser();

  let project;
  let result;
  let actors;
  try {
    ({ project } = await getProjectForUser(user.id, id));
    actors = await listAuditActors(user.id, id); // réservé aux admins
    result = await listAuditLogs(user.id, id, {
      userId: q.user || undefined,
      action: q.action,
      from: parseDay(q.from),
      to: parseDay(q.to, 1), // la date de fin est incluse
      page: q.page,
    });
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  const pageHref = (page: number) => {
    const p = new URLSearchParams();
    if (q.user) p.set("user", q.user);
    if (q.action) p.set("action", q.action);
    if (q.from) p.set("from", q.from);
    if (q.to) p.set("to", q.to);
    p.set("page", String(page));
    return `/projects/${id}/history?${p.toString()}`;
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <Link href={`/projects/${id}`} className="text-sm underline">
        ← {project.name}
      </Link>
      <h1 className="text-2xl font-bold">Historique des actions</h1>

      <form
        method="get"
        className="grid items-end gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="space-y-1">
          <label htmlFor="user" className="text-xs">
            Utilisateur
          </label>
          <select
            id="user"
            name="user"
            defaultValue={q.user ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">Tous</option>
            {actors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="action" className="text-xs">
            Action
          </label>
          <select
            id="action"
            name="action"
            defaultValue={q.action ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">Toutes</option>
            {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="from" className="text-xs">
            Du
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={q.from ?? ""}
            className={FIELD_CLASS}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="to" className="text-xs">
            Au
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={q.to ?? ""}
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm">
            Filtrer
          </Button>
          <Link href={`/projects/${id}/history`} className="text-sm underline">
            Réinitialiser
          </Link>
        </div>
      </form>

      <p className="text-sm text-muted-foreground">
        {result.total} action{result.total > 1 ? "s" : ""}
      </p>

      {result.items.length === 0 ? (
        <p className="text-sm">Aucune action ne correspond à ces filtres.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Action</th>
                <th className="p-3">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.items.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap p-3">
                    {log.createdAt.toLocaleString("fr-FR")}
                  </td>
                  <td className="p-3">{log.user.name}</td>
                  <td className="p-3">
                    {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="p-3">
                    {describeAudit(log.action, log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.pageCount > 1 && (
        <nav
          className="flex items-center justify-between text-sm"
          aria-label="Pagination"
        >
          {result.page > 1 ? (
            <Link href={pageHref(result.page - 1)} className="underline">
              ← Précédent
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {result.page} / {result.pageCount}
          </span>
          {result.page < result.pageCount ? (
            <Link href={pageHref(result.page + 1)} className="underline">
              Suivant →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
