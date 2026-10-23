import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { formatAdrNumber } from "@/lib/adr-format";
import {
  TASK_STATUS_LABELS,
  isOverdue,
  nextStatus,
  previousStatus,
  type TaskStatusValue,
} from "@/lib/task-status";
import type { listTasks } from "@/services/task.service";
import { moveTaskAction } from "./actions";

type Task = Awaited<ReturnType<typeof listTasks>>[number];

export function TaskCard({
  projectId,
  task,
}: {
  projectId: string;
  task: Task;
}) {
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
          Modifier
        </Link>
      </div>

      {task.description && (
        <details>
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Description
          </summary>
          <div className="mt-2">
            <Markdown>{task.description}</Markdown>
          </div>
        </details>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {task.assignee ? (
          <span className="rounded-full bg-muted px-2 py-0.5">
            {task.assignee.name}
          </span>
        ) : (
          <span className="text-muted-foreground">Non assignée</span>
        )}
        {task.dueDate && (
          <span className={overdue ? "font-medium text-red-600" : ""}>
            Échéance{" "}
            {/* date stockée à minuit UTC : on l'affiche en UTC, sinon décalage d'un jour */}
            {task.dueDate.toLocaleDateString("fr-FR", { timeZone: "UTC" })}
            {overdue && " (en retard)"}
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
              aria-label={`Déplacer vers ${TASK_STATUS_LABELS[prev]}`}
            >
              ← {TASK_STATUS_LABELS[prev]}
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
              aria-label={`Déplacer vers ${TASK_STATUS_LABELS[next]}`}
            >
              {TASK_STATUS_LABELS[next]} →
            </Button>
          </form>
        ) : (
          <span />
        )}
      </div>
    </li>
  );
}
