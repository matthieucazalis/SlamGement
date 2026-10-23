import { ADR_STATUSES, type AdrStatusValue } from "@/lib/adr-status";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { TASK_STATUSES, type TaskStatusValue } from "@/lib/task-status";

export async function getDashboard(userId: string, projectId: string) {
  const membership = await requireRole(userId, projectId);
  const isAdmin = membership.role === "ADMIN";

  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const [
    adrGrouped,
    memberCount,
    recent,
    taskGrouped,
    overdueTasks,
    adrsWithoutTask,
  ] = await Promise.all([
    prisma.adr.groupBy({
      by: ["status"],
      where: { projectId },
      _count: { _all: true },
    }),
    prisma.membership.count({ where: { projectId } }),
    prisma.auditLog.findMany({
      where: {
        projectId,
        // les emails invités ne sont visibles que des admins
        ...(isAdmin ? {} : { action: { not: "MEMBER_INVITED" } }),
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { projectId },
      _count: { _all: true },
    }),
    prisma.task.count({
      where: {
        projectId,
        status: { not: "DONE" },
        dueDate: { lt: startOfToday },
      },
    }),
    prisma.adr.findMany({
      where: { projectId, status: "ACCEPTED", tasks: { none: {} } },
      select: { number: true, title: true },
      orderBy: { number: "asc" },
      take: 10,
    }),
  ]);

  // tous les statuts apparaissent, même à zéro
  const byStatus = Object.fromEntries(
    ADR_STATUSES.map((s) => [s, 0]),
  ) as Record<AdrStatusValue, number>;
  for (const row of adrGrouped) byStatus[row.status] = row._count._all;

  const tasksByStatus = Object.fromEntries(
    TASK_STATUSES.map((s) => [s, 0]),
  ) as Record<TaskStatusValue, number>;
  for (const row of taskGrouped) tasksByStatus[row.status] = row._count._all;

  const totalAdrs = ADR_STATUSES.reduce((sum, s) => sum + byStatus[s], 0);
  const totalTasks = TASK_STATUSES.reduce(
    (sum, s) => sum + tasksByStatus[s],
    0,
  );

  return {
    byStatus,
    totalAdrs,
    memberCount,
    recent,
    isAdmin,
    tasksByStatus,
    totalTasks,
    overdueTasks,
    adrsWithoutTask,
  };
}
