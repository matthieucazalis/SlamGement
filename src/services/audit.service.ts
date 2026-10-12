import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

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
