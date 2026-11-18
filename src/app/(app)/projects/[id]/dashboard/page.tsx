import Link from "next/link";
import { notFound } from "next/navigation";
import { AdrStatusBadge } from "@/components/adr-status-badge";
import { getLocale, getT } from "@/i18n/server";
import { formatAdrNumber } from "@/lib/adr-format";
import { ADR_STATUSES } from "@/lib/adr-status";
import { describeAudit } from "@/lib/audit-labels";
import { formatDateTime } from "@/lib/format";
import { adrStatusLabel, displayName, taskStatusLabel } from "@/lib/labels";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { TASK_STATUSES } from "@/lib/task-status";
import { getDashboard } from "@/services/dashboard.service";
import { getProjectForUser } from "@/services/project.service";

function Stat({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p
        className={`text-3xl font-bold ${alert && value > 0 ? "text-red-600 dark:text-red-400" : ""}`}
      >
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Bar({ percent }: { percent: number }) {
  return (
    <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
      <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, t, locale] = await Promise.all([
    requireUser(),
    getT(),
    getLocale(),
  ]);

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
    <main id="main-content" className="mx-auto max-w-3xl space-y-8 p-4 sm:p-8">
      <Link href={`/projects/${id}`} className="text-sm underline">
        ← {project.name}
      </Link>
      <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label={t("dashboard.statAdrs")} value={data.totalAdrs} />
        <Stat label={t("dashboard.statTasks")} value={data.totalTasks} />
        <Stat
          label={t("dashboard.statOverdue")}
          value={data.overdueTasks}
          alert
        />
        <Stat label={t("dashboard.statMembers")} value={data.memberCount} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("dashboard.adrByStatus")}</h2>
        {data.totalAdrs === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("dashboard.noAdr")}
          </p>
        ) : (
          <ul className="space-y-2">
            {ADR_STATUSES.map((s) => {
              const count = data.byStatus[s];
              const percent = Math.round((count / data.totalAdrs) * 100);
              return (
                <li key={s} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <AdrStatusBadge status={s} label={adrStatusLabel(t, s)} />
                  </div>
                  <Bar percent={percent} />
                  <span className="w-24 text-right text-sm tabular-nums">
                    {count} ({t("dashboard.percent", { percent })})
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {t("dashboard.tasksByColumn")}
        </h2>
        {data.totalTasks === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("dashboard.noTasks")}
          </p>
        ) : (
          <ul className="space-y-2">
            {TASK_STATUSES.map((s) => {
              const count = data.tasksByStatus[s];
              const percent = Math.round((count / data.totalTasks) * 100);
              return (
                <li key={s} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm">
                    {taskStatusLabel(t, s)}
                  </span>
                  <Bar percent={percent} />
                  <span className="w-24 text-right text-sm tabular-nums">
                    {count} ({t("dashboard.percent", { percent })})
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {t("dashboard.withoutTaskTitle")}
        </h2>
        {data.adrsWithoutTask.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("dashboard.allPlanned")}
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.withoutTaskHelp")}
            </p>
            <ul className="divide-y rounded-lg border">
              {data.adrsWithoutTask.map((adr) => (
                <li key={adr.number} className="p-3 text-sm">
                  <Link
                    href={`/projects/${id}/adr/${adr.number}`}
                    className="underline"
                  >
                    ADR-{formatAdrNumber(adr.number)} : {adr.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("dashboard.recent")}</h2>
          {data.isAdmin && (
            <Link
              href={`/projects/${id}/history`}
              className="text-sm underline"
            >
              {t("dashboard.fullHistory")}
            </Link>
          )}
        </div>
        {data.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("dashboard.noActivity")}
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {data.recent.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap justify-between gap-2 p-3 text-sm"
              >
                <span>
                  <strong>{displayName(t, log.user.name)}</strong>{" "}
                  {describeAudit(t, log.action, log.metadata)}
                </span>
                <span className="text-muted-foreground">
                  {formatDateTime(log.createdAt, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
