import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export const AUDIT_ACTIONS = {
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_DELETED: "PROJECT_DELETED",
  MEMBER_INVITED: "MEMBER_INVITED",
  MEMBER_ROLE_CHANGED: "MEMBER_ROLE_CHANGED",
  MEMBER_REMOVED: "MEMBER_REMOVED",
  ADR_CREATED: "ADR_CREATED",
  ADR_UPDATED: "ADR_UPDATED",
  ADR_STATUS_CHANGED: "ADR_STATUS_CHANGED",
  ADR_DELETED: "ADR_DELETED",
  MEMBER_JOINED: "MEMBER_JOINED",
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_MOVED: "TASK_MOVED",
  TASK_DELETED: "TASK_DELETED",
} as const;

type LogInput = {
  userId: string;
  projectId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logAction(
  input: LogInput,
  db: Prisma.TransactionClient = prisma,
) {
  await db.auditLog.create({
    data: {
      userId: input.userId,
      projectId: input.projectId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}

export type AuditFilters = {
  userId?: string;
  action?: string;
  from?: Date;
  to?: Date;
  page: number;
};

const AUDIT_PAGE_SIZE = 20;

export async function listAuditLogs(
  actorId: string,
  projectId: string,
  filters: AuditFilters,
) {
  await requireRole(actorId, projectId, "ADMIN");

  const where: Prisma.AuditLogWhereInput = {
    projectId,
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lt: filters.to } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * AUDIT_PAGE_SIZE,
      take: AUDIT_PAGE_SIZE,
      include: { user: { select: { name: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items,
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE)),
  };
}

export async function listAuditActors(actorId: string, projectId: string) {
  await requireRole(actorId, projectId, "ADMIN");
  const rows = await prisma.auditLog.findMany({
    where: { projectId },
    distinct: ["userId"],
    select: { user: { select: { id: true, name: true } } },
  });
  return rows.map((r) => r.user);
}
