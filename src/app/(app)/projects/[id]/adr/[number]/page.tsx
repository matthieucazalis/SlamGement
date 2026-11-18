import Link from "next/link";
import { notFound } from "next/navigation";
import { AdrStatusBadge } from "@/components/adr-status-badge";
import { ClearDraft } from "@/components/clear-draft";
import { Markdown } from "@/components/markdown";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { getLocale, getT } from "@/i18n/server";
import { formatAdrNumber, parseAdrNumber } from "@/lib/adr-format";
import { allowedTransitions, isContentEditable } from "@/lib/adr-status";
import { formatDate } from "@/lib/format";
import {
  adrActionLabel,
  adrStatusLabel,
  displayName,
  taskStatusLabel,
} from "@/lib/labels";
import { ForbiddenError, requireRole } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { AdrNotFoundError, getAdr } from "@/services/adr.service";
import { listTasksByAdr } from "@/services/task.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changeStatusAction, deleteAdrAction } from "../actions";

function Section({ title, text }: { title: string; text: string }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Markdown>{text}</Markdown>
    </section>
  );
}

export default async function AdrDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; number: string }>;
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const { id, number: rawNumber } = await params;
  const { error, created } = await searchParams;
  const number = parseAdrNumber(rawNumber);
  if (!number) notFound();

  const [user, t, locale] = await Promise.all([
    requireUser(),
    getT(),
    getLocale(),
  ]);

  let adr;
  let membership;
  let tasks;
  try {
    adr = await getAdr(user.id, id, number);
    membership = await requireRole(user.id, id);
    tasks = await listTasksByAdr(user.id, id, adr.id);
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof AdrNotFoundError)
      notFound();
    throw e;
  }

  const transitions = allowedTransitions(adr.status);
  const errorMessage =
    error === "transition"
      ? t("adr.errorTransition")
      : error === "supersession"
        ? t("adr.errorSupersession")
        : error === "forbidden"
          ? t("adr.errorForbidden")
          : error === "invalid"
            ? t("adr.errorInvalid")
            : error === "locked"
              ? t("adr.errorLocked")
              : error === "in-use"
                ? t("adr.errorInUse")
                : null;

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      {created === "1" && (
        <ClearDraft storageKey={`slamgement:adr-draft:${id}`} />
      )}
      <Link href={`/projects/${id}/adr`} className="text-sm underline">
        {t("adr.backToList")}
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">
          ADR-{formatAdrNumber(adr.number)} : {adr.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <AdrStatusBadge
            status={adr.status}
            label={adrStatusLabel(t, adr.status)}
          />
          <span>
            {t("adr.by", {
              author: displayName(t, adr.author.name),
              date: formatDate(adr.createdAt, locale),
            })}
          </span>
        </div>
        {adr.supersededBy && (
          <p className="text-sm">
            {t("adr.supersededBy")}{" "}
            <Link
              href={`/projects/${id}/adr/${adr.supersededBy.number}`}
              className="underline"
            >
              ADR-{formatAdrNumber(adr.supersededBy.number)} :{" "}
              {adr.supersededBy.title}
            </Link>
          </p>
        )}
        {adr.supersedes && (
          <p className="text-sm">
            {t("adr.supersedes")}{" "}
            <Link
              href={`/projects/${id}/adr/${adr.supersedes.number}`}
              className="underline"
            >
              ADR-{formatAdrNumber(adr.supersedes.number)} :{" "}
              {adr.supersedes.title}
            </Link>
          </p>
        )}
      </header>

      {errorMessage && (
        <p
          className="rounded-md border border-red-300 p-3 text-sm text-red-600 dark:border-red-800 dark:text-red-400"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3">
        {/* Les boutons n'apparaissent que si la transition est autorisée,
            mais la vérification reste côté serveur (adr.service). */}
        {transitions
          .filter((s) => s !== "SUPERSEDED")
          .map((s) => (
            <form
              key={s}
              action={changeStatusAction.bind(null, id, adr.number)}
            >
              <input type="hidden" name="newStatus" value={s} />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                data-haptic="light"
              >
                {adrActionLabel(t, s)}
              </Button>
            </form>
          ))}

        {transitions.includes("SUPERSEDED") && (
          <form
            action={changeStatusAction.bind(null, id, adr.number)}
            className="flex items-end gap-2"
          >
            <input type="hidden" name="newStatus" value="SUPERSEDED" />
            <div>
              <label htmlFor="replacement" className="text-xs">
                {t("adr.replacedByNumber")}
              </label>
              <Input
                id="replacement"
                name="replacement"
                type="number"
                min={1}
                required
                className="h-8 w-24"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              data-haptic="light"
            >
              {adrActionLabel(t, "SUPERSEDED")}
            </Button>
          </form>
        )}

        {isContentEditable(adr.status) && (
          <Link
            href={`/projects/${id}/adr/${adr.number}/edit`}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            {t("adr.edit")}
          </Link>
        )}

        <a
          href={`/projects/${id}/adr/${adr.number}/export`}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          {t("adr.exportMd")}
        </a>
      </div>

      <Section title={t("adr.sectionContext")} text={adr.context} />
      <Section title={t("adr.sectionDecision")} text={adr.decision} />
      <Section title={t("adr.sectionConsequences")} text={adr.consequences} />
      {adr.alternatives && (
        <Section title={t("adr.sectionAlternatives")} text={adr.alternatives} />
      )}

      {adr.mermaidCode && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("adr.sectionDiagram")}</h2>
          <MermaidDiagram code={adr.mermaidCode} />
          <details className="text-sm">
            <summary className="cursor-pointer">{t("adr.viewMermaid")}</summary>
            <pre className="mt-2 overflow-x-auto rounded-md border p-3">
              {adr.mermaidCode}
            </pre>
          </details>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{t("adr.linkedTasks")}</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("adr.noLinkedTasks")}
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
              >
                <Link
                  href={`/projects/${id}/kanban/${task.id}`}
                  className="underline"
                >
                  {task.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {taskStatusLabel(t, task.status)} ·{" "}
                  {task.assignee
                    ? displayName(t, task.assignee.name)
                    : t("adr.unassigned")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {membership.role === "ADMIN" && (
        <section className="space-y-3 rounded-lg border border-red-300 p-4 dark:border-red-800">
          <h2 className="font-semibold text-red-600 dark:text-red-400">
            {t("adr.dangerTitle")}
          </h2>
          <form
            action={deleteAdrAction.bind(null, id, adr.number)}
            className="space-y-3"
          >
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="confirm" required />
              {t("adr.confirmDelete")}
            </label>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              data-haptic="error"
            >
              {t("adr.deleteButton")}
            </Button>
          </form>
        </section>
      )}
    </main>
  );
}
