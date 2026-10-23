import type { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { TaskStatusValue } from "@/lib/task-status";
import type { TaskInput } from "@/lib/validators/task";
import { AUDIT_ACTIONS, logAction } from "@/services/audit.service";

export class TaskNotFoundError extends Error {}
export class InvalidAssigneeError extends Error {}
export class InvalidAdrError extends Error {}

async function assertAssignee(
  tx: Prisma.TransactionClient,
  projectId: string,
  assigneeId?: string | null,
) {
  if (!assigneeId) return;
  const membership = await tx.membership.findUnique({
    where: { userId_projectId: { userId: assigneeId, projectId } },
  });
  if (!membership) throw new InvalidAssigneeError();
}

async function assertAdr(
  tx: Prisma.TransactionClient,
  projectId: string,
  adrId?: string | null,
) {
  if (!adrId) return;
  const adr = await tx.adr.findFirst({
    where: { id: adrId, projectId },
    select: { id: true },
  });
  if (!adr) throw new InvalidAdrError();
}

async function nextPosition(
  tx: Prisma.TransactionClient,
  projectId: string,
  status: TaskStatusValue,
) {
  const last = await tx.task.aggregate({
    where: { projectId, status },
    _max: { position: true },
  });
  return (last._max.position ?? -1) + 1;
}

export type TaskFilters = {
  assigneeId?: string; // identifiant d'un membre, ou "none" pour les non assignées
};

export async function listTasks(
  userId: string,
  projectId: string,
  filters: TaskFilters = {},
) {
  await requireRole(userId, projectId);

  const assigneeWhere =
    filters.assigneeId === "none"
      ? { assigneeId: null }
      : filters.assigneeId
        ? { assigneeId: filters.assigneeId }
        : {};

  return prisma.task.findMany({
    where: { projectId, ...assigneeWhere },
    include: {
      assignee: { select: { id: true, name: true } },
      adr: { select: { number: true, title: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

export async function listTasksByAdr(
  userId: string,
  projectId: string,
  adrId: string,
) {
  await requireRole(userId, projectId);
  return prisma.task.findMany({
    where: { projectId, adrId },
    include: { assignee: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });
}

export async function getTask(
  userId: string,
  projectId: string,
  taskId: string,
) {
  await requireRole(userId, projectId);
  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId },
  });
  if (!task) throw new TaskNotFoundError();
  return task;
}

export async function createTask(
  userId: string,
  projectId: string,
  input: TaskInput,
) {
  await requireRole(userId, projectId);

  return prisma.$transaction(async (tx) => {
    await assertAssignee(tx, projectId, input.assigneeId);
    await assertAdr(tx, projectId, input.adrId);

    const task = await tx.task.create({
      data: {
        projectId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        assigneeId: input.assigneeId,
        adrId: input.adrId,
        position: await nextPosition(tx, projectId, "TODO"),
      },
    });

    await logAction(
      {
        userId,
        projectId,
        action: AUDIT_ACTIONS.TASK_CREATED,
        entityType: "Task",
        entityId: task.id,
        metadata: { title: task.title },
      },
      tx,
    );
    return task;
  });
}

export async function updateTask(
  userId: string,
  projectId: string,
  taskId: string,
  input: TaskInput,
) {
  await requireRole(userId, projectId);

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) throw new TaskNotFoundError();

    await assertAssignee(tx, projectId, input.assigneeId);
    await assertAdr(tx, projectId, input.adrId);

    const changed: string[] = [];
    if (input.title !== task.title) changed.push("title");
    if ((input.description ?? null) !== task.description)
      changed.push("description");
    if (
      (input.dueDate?.getTime() ?? null) !== (task.dueDate?.getTime() ?? null)
    )
      changed.push("dueDate");
    if ((input.assigneeId ?? null) !== task.assigneeId)
      changed.push("assignee");
    if ((input.adrId ?? null) !== task.adrId) changed.push("adr");

    const updated = await tx.task.update({
      where: { id: task.id },
      data: {
        title: input.title,
        description: input.description ?? null,
        dueDate: input.dueDate ?? null,
        assigneeId: input.assigneeId ?? null,
        adrId: input.adrId ?? null,
      },
    });

    await logAction(
      {
        userId,
        projectId,
        action: AUDIT_ACTIONS.TASK_UPDATED,
        entityType: "Task",
        entityId: task.id,
        metadata: { title: updated.title, fields: changed },
      },
      tx,
    );
    return updated;
  });
}

export async function moveTask(
  userId: string,
  projectId: string,
  taskId: string,
  newStatus: TaskStatusValue,
) {
  await requireRole(userId, projectId);

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) throw new TaskNotFoundError();
    if (task.status === newStatus) return task; // rien à faire, rien à tracer

    // la carte arrive en bas de la colonne d'arrivée
    const updated = await tx.task.update({
      where: { id: task.id },
      data: {
        status: newStatus,
        position: await nextPosition(tx, projectId, newStatus),
      },
    });

    await logAction(
      {
        userId,
        projectId,
        action: AUDIT_ACTIONS.TASK_MOVED,
        entityType: "Task",
        entityId: task.id,
        metadata: { title: task.title, from: task.status, to: newStatus },
      },
      tx,
    );
    return updated;
  });
}

export async function deleteTask(
  userId: string,
  projectId: string,
  taskId: string,
) {
  await requireRole(userId, projectId);

  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) throw new TaskNotFoundError();

    await logAction(
      {
        userId,
        projectId,
        action: AUDIT_ACTIONS.TASK_DELETED,
        entityType: "Task",
        entityId: task.id,
        metadata: { title: task.title },
      },
      tx,
    );
    await tx.task.delete({ where: { id: task.id } });
  });
}
