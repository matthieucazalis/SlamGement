import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { getLocale, getT } from "@/i18n/server";
import { formatAdrNumber } from "@/lib/adr-format";
import { formatDueDate } from "@/lib/format";
import { displayName, taskStatusLabel } from "@/lib/labels";
import {
  isOverdue,
  nextStatus,
  previousStatus,
  type TaskStatusValue,
} from "@/lib/task-status";
import type { listTasks } from "@/services/task.service";
import { moveTaskAction } from "./actions";

type Task = Awaited<ReturnType<typeof listTasks>>[number];

export async function TaskCard({
  projectId,
  task,
}: {
  projectId: string;
  task: Task;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const prev = previousStatus(task.status);
  const next = nextStatus(task.status);
  const overdue = isOverdue(task.dueDate, task.status);
  const move = (to: TaskStatusValue) =>
    moveTaskAction.bind(null, projectId, task.id, to);

  return (
    <li className="space-y-2 rounded-lg border bg-background p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{task.title}</p>
        <Link
          href={`/projects/${projectId}/kanban/${task.id}`}
          className="shrink-0 text-xs underline"
        >
          {t("kanban.edit")}
        </Link>
      </div>

      {task.description && (
        <details>
          <summary className="cursor-pointer text-xs text-muted-foreground">
            {t("kanban.description")}
          </summary>
          <div className="mt-2">
            <Markdown>{task.description}</Markdown>
          </div>
        </details>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {task.assignee ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted py-0.5 pl-0.5 pr-2">
            <UserAvatar
              name={displayName(t, task.assignee.name)}
              src={task.assignee.avatar}
              size={18}
            />
            {displayName(t, task.assignee.name)}
          </span>
        ) : (
          <span className="text-muted-foreground">
            {t("kanban.unassigned")}
          </span>
        )}
        {task.dueDate && (
          <span
            className={
              overdue ? "font-medium text-red-600 dark:text-red-400" : ""
            }
          >
            {t("kanban.due", { date: formatDueDate(task.dueDate, locale) })}
            {overdue && ` ${t("kanban.overdue")}`}
          </span>
        )}
      </div>

      {task.adr && (
        <p className="text-xs">
          <Link
            href={`/projects/${projectId}/adr/${task.adr.number}`}
            className="underline"
          >
            ADR-{formatAdrNumber(task.adr.number)} : {task.adr.title}
          </Link>
        </p>
      )}

      <div className="flex justify-between pt-1">
        {prev ? (
          <form action={move(prev)}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              data-haptic="light"
              aria-label={t("kanban.moveTo", {
                status: taskStatusLabel(t, prev),
              })}
            >
              ← {taskStatusLabel(t, prev)}
            </Button>
          </form>
        ) : (
          <span />
        )}
        {next ? (
          <form action={move(next)}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              data-haptic="light"
              aria-label={t("kanban.moveTo", {
                status: taskStatusLabel(t, next),
              })}
            >
              {taskStatusLabel(t, next)} →
            </Button>
          </form>
        ) : (
          <span />
        )}
      </div>
    </li>
  );
}
