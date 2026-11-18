import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdrStatusBadge } from "@/components/adr-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLocale, getT } from "@/i18n/server";
import { ADR_STATUSES } from "@/lib/adr-status";
import { formatAdrNumber } from "@/lib/adr-format";
import { formatDate } from "@/lib/format";
import { adrStatusLabel, displayName } from "@/lib/labels";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { listAdrs } from "@/services/adr.service";
import { getProjectForUser } from "@/services/project.service";

// Les paramètres d'URL sont de l'entrée utilisateur : une valeur invalide
// est simplement ignorée.
const querySchema = z.object({
  status: z.enum(ADR_STATUSES).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
});

export default async function AdrListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const { status: filter, q } = querySchema.parse(await searchParams);
  const [user, t, locale] = await Promise.all([
    requireUser(),
    getT(),
    getLocale(),
  ]);

  let project;
  let adrs;
  try {
    ({ project } = await getProjectForUser(user.id, id));
    adrs = await listAdrs(user.id, id, filter, q);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  const pill = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active ? "bg-muted font-medium" : ""}`;
  // les pastilles de statut conservent la recherche en cours
  const statusHref = (s?: string) => {
    const p = new URLSearchParams();
    if (s) p.set("status", s);
    if (q) p.set("q", q);
    const qs = p.toString();
    return `/projects/${id}/adr${qs ? `?${qs}` : ""}`;
  };

  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
      <Link href={`/projects/${id}`} className="text-sm underline">
        ← {project.name}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("adr.title")}</h1>
        <div className="flex items-center gap-2">
          <a
            href={`/projects/${id}/adr/export`}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {t("adr.exportAll")}
          </a>
          <Link
            href={`/projects/${id}/adr/new`}
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            {t("adr.new")}
          </Link>
        </div>
      </div>

      <form method="get" role="search" className="flex items-end gap-2">
        {filter && <input type="hidden" name="status" value={filter} />}
        <div className="flex-1 space-y-1">
          <label htmlFor="q" className="text-xs">
            {t("adr.searchLabel")}
          </label>
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder={t("adr.searchPlaceholder")}
            maxLength={100}
          />
        </div>
        <Button type="submit" size="sm">
          {t("common.search")}
        </Button>
        {q && (
          <Link href={statusHref(filter)} className="pb-2 text-sm underline">
            {t("common.reset")}
          </Link>
        )}
      </form>

      <nav
        className="flex flex-wrap gap-2"
        aria-label={t("adr.filterByStatus")}
      >
        <Link href={statusHref()} className={pill(!filter)}>
          {t("adr.all")}
        </Link>
        {ADR_STATUSES.map((s) => (
          <Link key={s} href={statusHref(s)} className={pill(filter === s)}>
            {adrStatusLabel(t, s)}
          </Link>
        ))}
      </nav>

      {adrs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {q
            ? t("adr.emptySearch", { q })
            : filter
              ? t("adr.emptyFiltered")
              : t("adr.empty")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left">
              <tr>
                <th className="p-3">{t("adr.colNumber")}</th>
                <th className="p-3">{t("adr.colTitle")}</th>
                <th className="p-3">{t("adr.colStatus")}</th>
                <th className="p-3">{t("adr.colAuthor")}</th>
                <th className="p-3">{t("adr.colDate")}</th>
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
                    <AdrStatusBadge
                      status={adr.status}
                      label={adrStatusLabel(t, adr.status)}
                    />
                  </td>
                  <td className="p-3">{displayName(t, adr.author.name)}</td>
                  <td className="p-3">{formatDate(adr.createdAt, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
