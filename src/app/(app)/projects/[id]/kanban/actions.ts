"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { TASK_STATUSES } from "@/lib/task-status";
import { taskSchema } from "@/lib/validators/task";
import {
  InvalidAssigneeError,
  TaskNotFoundError,
  createTask,
  deleteTask,
  moveTask,
  updateTask,
} from "@/services/task.service";

export type TaskFormState =
  | { error?: string; values?: Record<string, string> }
  | undefined;

function serviceError(e: unknown): string | null {
  if (e instanceof ForbiddenError) return "Accès refusé.";
  if (e instanceof InvalidAssigneeError)
    return "Cette personne n'est pas membre du projet.";
  if (e instanceof TaskNotFoundError) return "Tâche introuvable.";
  return null;
}

export async function createTaskAction(
  projectId: string,
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success)
    return { error: parsed.error.issues[0].message, values: raw };

  try {
    await createTask(user.id, projectId, parsed.data);
  } catch (e) {
    const message = serviceError(e);
    if (message) return { error: message, values: raw };
    throw e;
  }

  revalidatePath(`/projects/${projectId}/kanban`);
  return undefined;
}

export async function updateTaskAction(
  projectId: string,
  taskId: string,
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success)
    return { error: parsed.error.issues[0].message, values: raw };

  try {
    await updateTask(user.id, projectId, taskId, parsed.data);
  } catch (e) {
    const message = serviceError(e);
    if (message) return { error: message, values: raw };
    throw e;
  }

  revalidatePath(`/projects/${projectId}/kanban`);
  redirect(`/projects/${projectId}/kanban`);
}

export async function moveTaskAction(
  projectId: string,
  taskId: string,
  newStatus: string,
  _formData: FormData,
) {
  const user = await requireUser();
  const base = `/projects/${projectId}/kanban`;

  const status = z.enum(TASK_STATUSES).safeParse(newStatus);
  if (!status.success) redirect(`${base}?error=invalid`);

  try {
    await moveTask(user.id, projectId, taskId, status.data);
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof TaskNotFoundError)
      redirect(`${base}?error=forbidden`);
    throw e;
  }

  revalidatePath(base);
}

export async function deleteTaskAction(
  projectId: string,
  taskId: string,
  formData: FormData,
) {
  const user = await requireUser();
  const base = `/projects/${projectId}/kanban`;

  if (formData.get("confirm") !== "on") redirect(`${base}/${taskId}`);

  try {
    await deleteTask(user.id, projectId, taskId);
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof TaskNotFoundError)
      redirect(`${base}?error=forbidden`);
    throw e;
  }

  revalidatePath(base);
  redirect(base);
}
