import Link from "next/link";
import { notFound } from "next/navigation";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { listAdrs } from "@/services/adr.service";
import { listMembers } from "@/services/member.service";
import { TaskNotFoundError, getTask } from "@/services/task.service";
import { Button } from "@/components/ui/button";
import { deleteTaskAction, updateTaskAction } from "../actions";
import { TaskForm } from "../task-form";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;
  const user = await requireUser();

  let task;
  let members;
  let adrs;
  try {
    task = await getTask(user.id, id, taskId);
    members = await listMembers(user.id, id);
    adrs = await listAdrs(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof TaskNotFoundError)
      notFound();
    throw e;
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 p-8">
      <Link href={`/projects/${id}/kanban`} className="text-sm underline">
        ← Tableau Kanban
      </Link>
      <h1 className="text-2xl font-bold">Modifier la tâche</h1>

      <TaskForm
        action={updateTaskAction.bind(null, id, task.id)}
        members={members.map((m) => ({ id: m.userId, name: m.user.name }))}
        adrs={adrs.map((a) => ({ id: a.id, number: a.number, title: a.title }))}
        initial={{
          title: task.title,
          description: task.description ?? "",
          dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : "",
          assigneeId: task.assigneeId ?? "",
          adrId: task.adrId ?? "",
        }}
        submitLabel="Enregistrer"
      />

      <section className="space-y-3 rounded-lg border border-red-300 p-4">
        <h2 className="font-semibold text-red-600">Zone dangereuse</h2>
        <form
          action={deleteTaskAction.bind(null, id, task.id)}
          className="space-y-3"
        >
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="confirm" required />
            Je confirme vouloir supprimer cette tâche
          </label>
          <Button type="submit" variant="destructive" size="sm">
            Supprimer la tâche
          </Button>
        </form>
      </section>
    </main>
  );
}
