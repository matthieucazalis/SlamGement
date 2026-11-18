import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getT } from "@/i18n/server";
import { taskStatusLabel } from "@/lib/labels";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { TASK_STATUSES, type TaskStatusValue } from "@/lib/task-status";
import { displayName } from "@/lib/labels";
import { listAdrs } from "@/services/adr.service";
import { listMembers } from "@/services/member.service";
import { getProjectForUser } from "@/services/project.service";
import { listTasks } from "@/services/task.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTaskAction } from "./actions";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";

type TaskList = Awaited<ReturnType<typeof listTasks>>;

// Les paramètres d'URL sont de l'entrée utilisateur : une valeur
// invalide est simplement ignorée.
const querySchema = z.object({
  assignee: z.string().max(40).optional().catch(undefined),
  status: z.enum(TASK_STATUSES).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  error: z.string().max(20).optional().catch(undefined),
});

const FIELD_CLASS = "h-9 w-full rounded-md border bg-transparent px-2 text-sm";

export default async function KanbanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const q = querySchema.parse(await searchParams);
  const [user, t] = await Promise.all([requireUser(), getT()]);

  let project;
  let members;
  let adrs;
  let tasks: TaskList;
  try {
    ({ project } = await getProjectForUser(user.id, id));
    members = await listMembers(user.id, id);
    adrs = await listAdrs(user.id, id);
    tasks = await listTasks(user.id, id, {
      assigneeId: q.assignee,
      search: q.q,
    });
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  const byStatus = Object.fromEntries(
    TASK_STATUSES.map((s) => [s, [] as TaskList]),
  ) as Record<TaskStatusValue, TaskList>;
  for (const task of tasks) byStatus[task.status].push(task);

  const visibleColumns = q.status ? [q.status] : TASK_STATUSES;
  const memberOptions = members.map((m) => ({
    id: m.userId,
    name: displayName(t, m.user.name),
  }));
  const adrOptions = adrs.map((a) => ({
    id: a.id,
    number: a.number,
    title: a.title,
  }));
  const errorMessage =
    q.error === "forbidden"
      ? t("kanban.errorForbidden")
      : q.error === "invalid"
        ? t("kanban.errorInvalid")
        : null;

  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <Link href={`/projects/${id}`} className="text-sm underline">
        ← {project.name}
      </Link>
      <h1 className="text-2xl font-bold">{t("kanban.title")}</h1>

      {errorMessage && (
        <p
          className="rounded-md border border-red-300 p-3 text-sm text-red-600 dark:border-red-800 dark:text-red-400"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer font-semibold">
          {t("kanban.newTask")}
        </summary>
        <div className="mt-4 max-w-xl">
          <TaskForm
            action={createTaskAction.bind(null, id)}
            members={memberOptions}
            adrs={adrOptions}
            submitLabel={t("kanban.addTask")}
          />
        </div>
      </details>

      <form
        method="get"
        role="search"
        className="grid items-end gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="space-y-1">
          <label htmlFor="q" className="text-xs">
            {t("kanban.searchLabel")}
          </label>
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={q.q ?? ""}
            placeholder={t("kanban.searchPlaceholder")}
            maxLength={100}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="assignee" className="text-xs">
            {t("kanban.filterMember")}
          </label>
          <select
            id="assignee"
            name="assignee"
            defaultValue={q.assignee ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">{t("kanban.all")}</option>
            <option value="none">{t("kanban.unassignedPlural")}</option>
            {memberOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="status" className="text-xs">
            {t("kanban.filterColumn")}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={q.status ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">{t("kanban.allColumns")}</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {taskStatusLabel(t, s)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm">
            {t("kanban.filter")}
          </Button>
          <Link href={`/projects/${id}/kanban`} className="text-sm underline">
            {t("kanban.reset")}
          </Link>
        </div>
      </form>

      <div
        className={`grid gap-4 ${visibleColumns.length > 1 ? "md:grid-cols-2 xl:grid-cols-4" : "max-w-sm"}`}
      >
        {visibleColumns.map((status) => (
          <section
            key={status}
            aria-label={taskStatusLabel(t, status)}
            className="space-y-3 rounded-lg bg-muted/40 p-3"
          >
            <h2 className="flex items-center justify-between text-sm font-semibold">
              {taskStatusLabel(t, status)}
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {byStatus[status].length}
              </span>
            </h2>
            {byStatus[status].length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("kanban.noTasks")}
              </p>
            ) : (
              <ul className="space-y-3">
                {byStatus[status].map((task) => (
                  <TaskCard key={task.id} projectId={id} task={task} />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
