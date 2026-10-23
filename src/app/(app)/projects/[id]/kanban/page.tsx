import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type TaskStatusValue,
} from "@/lib/task-status";
import { listAdrs } from "@/services/adr.service";
import { listMembers } from "@/services/member.service";
import { getProjectForUser } from "@/services/project.service";
import { listTasks } from "@/services/task.service";
import { Button } from "@/components/ui/button";
import { createTaskAction } from "./actions";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";

type TaskList = Awaited<ReturnType<typeof listTasks>>;

const ERRORS: Record<string, string> = {
  forbidden: "Action non autorisée.",
  invalid: "Données invalides.",
};

// Les paramètres d'URL sont de l'entrée utilisateur : une valeur
// invalide est simplement ignorée.
const querySchema = z.object({
  assignee: z.string().max(40).optional().catch(undefined),
  status: z.enum(TASK_STATUSES).optional().catch(undefined),
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
  const user = await requireUser();

  let project;
  let members;
  let adrs;
  let tasks: TaskList;
  try {
    ({ project } = await getProjectForUser(user.id, id));
    members = await listMembers(user.id, id);
    adrs = await listAdrs(user.id, id);
    tasks = await listTasks(user.id, id, { assigneeId: q.assignee });
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
    name: m.user.name,
  }));
  const adrOptions = adrs.map((a) => ({
    id: a.id,
    number: a.number,
    title: a.title,
  }));

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-8">
      <Link href={`/projects/${id}`} className="text-sm underline">
        ← {project.name}
      </Link>
      <h1 className="text-2xl font-bold">Tableau Kanban</h1>

      {q.error && ERRORS[q.error] && (
        <p
          className="rounded-md border border-red-300 p-3 text-sm text-red-600"
          role="alert"
        >
          {ERRORS[q.error]}
        </p>
      )}

      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer font-semibold">
          Nouvelle tâche
        </summary>
        <div className="mt-4 max-w-xl">
          <TaskForm
            action={createTaskAction.bind(null, id)}
            members={memberOptions}
            adrs={adrOptions}
            submitLabel="Ajouter la tâche"
          />
        </div>
      </details>

      <form
        method="get"
        className="grid items-end gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="space-y-1">
          <label htmlFor="assignee" className="text-xs">
            Membre
          </label>
          <select
            id="assignee"
            name="assignee"
            defaultValue={q.assignee ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">Tous</option>
            <option value="none">Non assignées</option>
            {memberOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="status" className="text-xs">
            Colonne
          </label>
          <select
            id="status"
            name="status"
            defaultValue={q.status ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">Toutes</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm">
            Filtrer
          </Button>
          <Link href={`/projects/${id}/kanban`} className="text-sm underline">
            Réinitialiser
          </Link>
        </div>
      </form>

      <div
        className={`grid gap-4 ${visibleColumns.length > 1 ? "md:grid-cols-2 xl:grid-cols-4" : "max-w-sm"}`}
      >
        {visibleColumns.map((status) => (
          <section
            key={status}
            aria-label={TASK_STATUS_LABELS[status]}
            className="space-y-3 rounded-lg bg-muted/40 p-3"
          >
            <h2 className="flex items-center justify-between text-sm font-semibold">
              {TASK_STATUS_LABELS[status]}
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {byStatus[status].length}
              </span>
            </h2>
            {byStatus[status].length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune tâche.</p>
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
