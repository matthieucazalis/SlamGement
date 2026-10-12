import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, requireRole } from "@/lib/permissions";
import { AUDIT_ACTIONS, logAction } from "@/services/audit.service";

export class LastAdminError extends Error {}
export class MemberNotFoundError extends Error {}

export async function listMembers(userId: string, projectId: string) {
  await requireRole(userId, projectId);
  return prisma.membership.findMany({
    where: { projectId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });
}

export async function changeMemberRole(
  actorId: string,
  projectId: string,
  membershipId: string,
  newRole: Role,
) {
  await requireRole(actorId, projectId, "ADMIN");

  await prisma.$transaction(async (tx) => {
    const target = await tx.membership.findFirst({
      where: { id: membershipId, projectId },
    });
    if (!target) throw new MemberNotFoundError();
    if (target.role === newRole) return;

    if (target.role === "ADMIN" && newRole === "MEMBER") {
      const admins = await tx.membership.count({
        where: { projectId, role: "ADMIN" },
      });
      if (admins <= 1) throw new LastAdminError();
    }

    await tx.membership.update({
      where: { id: target.id },
      data: { role: newRole },
    });

    await logAction(
      {
        userId: actorId,
        projectId,
        action: AUDIT_ACTIONS.MEMBER_ROLE_CHANGED,
        entityType: "Membership",
        entityId: target.id,
        metadata: {
          targetUserId: target.userId,
          from: target.role,
          to: newRole,
        },
      },
      tx,
    );
  });
}

export async function removeMember(
  actorId: string,
  projectId: string,
  membershipId: string,
) {
  const actor = await requireRole(actorId, projectId);

  return prisma.$transaction(async (tx) => {
    const target = await tx.membership.findFirst({
      where: { id: membershipId, projectId },
    });
    if (!target) throw new MemberNotFoundError();

    const isSelf = target.userId === actorId;
    if (!isSelf && actor.role !== "ADMIN") throw new ForbiddenError();

    if (target.role === "ADMIN") {
      const admins = await tx.membership.count({
        where: { projectId, role: "ADMIN" },
      });
      if (admins <= 1) throw new LastAdminError();
    }

    await tx.membership.delete({ where: { id: target.id } });

    await logAction(
      {
        userId: actorId,
        projectId,
        action: AUDIT_ACTIONS.MEMBER_REMOVED,
        entityType: "Membership",
        entityId: target.id,
        metadata: { targetUserId: target.userId, left: isSelf },
      },
      tx,
    );

    return { left: isSelf };
  });
}
