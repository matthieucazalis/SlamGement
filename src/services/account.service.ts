import bcrypt from "bcryptjs";
import { DELETED_USER_NAME } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAction } from "@/services/audit.service";
import { WrongPasswordError } from "@/services/user.service";

// Le compte est le dernier administrateur d'un projet qui a d'autres membres
export class LastAdminBlockedError extends Error {
  constructor(public projectName: string) {
    super("LastAdminBlocked");
  }
}

export async function setAvatar(userId: string, dataUrl: string | null) {
  await prisma.user.update({
    where: { id: userId },
    data: { avatar: dataUrl },
  });
}

// Droit à l'effacement (RGPD, art. 17). On anonymise plutôt que de supprimer la
// ligne : les décisions (ADR) et l'historique des projets partagés doivent
// rester cohérents, mais ils ne sont plus rattachés à une personne identifiable.
export async function deleteAccount(userId: string, password: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw new WrongPasswordError();
  if (!(await bcrypt.compare(password, user.passwordHash)))
    throw new WrongPasswordError();

  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          _count: { select: { memberships: true } },
        },
      },
    },
  });

  // 1. On ne laisse jamais un projet partagé sans administrateur
  for (const m of memberships) {
    if (m.role !== "ADMIN" || m.project._count.memberships <= 1) continue;
    const otherAdmins = await prisma.membership.count({
      where: { projectId: m.projectId, role: "ADMIN", userId: { not: userId } },
    });
    if (otherAdmins === 0) throw new LastAdminBlockedError(m.project.name);
  }

  await prisma.$transaction(async (tx) => {
    for (const m of memberships) {
      if (m.project._count.memberships <= 1)
        await tx.project.delete({ where: { id: m.projectId } }); // seul membre : le projet disparaît
      else await tx.membership.delete({ where: { id: m.id } });
    }

    await tx.task.updateMany({
      where: { assigneeId: userId },
      data: { assigneeId: null },
    });
    await tx.invitation.deleteMany({ where: { email: user.email } });
    await tx.passwordResetToken.deleteMany({ where: { userId } });

    await tx.user.update({
      where: { id: userId },
      data: {
        name: DELETED_USER_NAME,
        email: `deleted-${userId}@deleted.invalid`,
        // valeur qui n'est pas une empreinte bcrypt valide : aucune connexion possible
        passwordHash: "!deleted",
        avatar: null,
        locale: null,
        theme: null,
        deletedAt: new Date(),
      },
    });

    await logAction(
      {
        userId,
        action: AUDIT_ACTIONS.ACCOUNT_DELETED,
        entityType: "User",
        entityId: userId,
      },
      tx,
    );
  });
}

// Droit d'accès et à la portabilité (RGPD, art. 15 et 20) : toutes les données
// rattachées au compte, dans un format lisible par une machine.
export async function exportUserData(userId: string) {
  const [user, memberships, adrs, tasks, logs] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        locale: true,
        theme: true,
        haptics: true,
        avatar: true,
      },
    }),
    prisma.membership.findMany({
      where: { userId },
      include: { project: { select: { id: true, name: true } } },
    }),
    prisma.adr.findMany({
      where: { authorId: userId },
      select: {
        number: true,
        title: true,
        status: true,
        createdAt: true,
        project: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.task.findMany({
      where: { assigneeId: userId },
      select: {
        title: true,
        status: true,
        dueDate: true,
        project: { select: { name: true } },
      },
    }),
    prisma.auditLog.findMany({
      where: { userId },
      select: {
        action: true,
        entityType: true,
        createdAt: true,
        metadata: true,
        project: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 5000,
    }),
  ]);

  await logAction({
    userId,
    action: AUDIT_ACTIONS.ACCOUNT_DATA_EXPORTED,
    entityType: "User",
    entityId: userId,
  });

  const { avatar, ...profile } = user;
  return {
    exportedAt: new Date().toISOString(),
    profile: { ...profile, hasAvatar: avatar !== null },
    projects: memberships.map((m) => ({
      project: m.project.name,
      role: m.role,
    })),
    decisions: adrs.map((a) => ({
      project: a.project.name,
      number: a.number,
      title: a.title,
      status: a.status,
      createdAt: a.createdAt,
    })),
    tasksAssignedToMe: tasks.map((t) => ({
      project: t.project.name,
      title: t.title,
      status: t.status,
      dueDate: t.dueDate,
    })),
    activity: logs.map((l) => ({
      project: l.project?.name ?? null,
      action: l.action,
      entityType: l.entityType,
      createdAt: l.createdAt,
      metadata: l.metadata,
    })),
  };
}
