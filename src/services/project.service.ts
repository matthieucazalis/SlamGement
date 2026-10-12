import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { AUDIT_ACTIONS, logAction } from "@/services/audit.service";

export async function createProject(
  userId: string,
  input: { name: string; description?: string },
) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: input.name,
        description: input.description,
        memberships: { create: { userId, role: "ADMIN" } },
      },
    });

    await logAction(
      {
        userId,
        projectId: project.id,
        action: AUDIT_ACTIONS.PROJECT_CREATED,
        entityType: "Project",
        entityId: project.id,
        metadata: { name: project.name },
      },
      tx,
    );

    return project;
  });
}

export async function listProjectsForUser(userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    include: { project: true },
    orderBy: { joinedAt: "desc" },
  });
}

export async function getProjectForUser(userId: string, projectId: string) {
  const membership = await requireRole(userId, projectId);
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
  });
  return { project, role: membership.role };
}
