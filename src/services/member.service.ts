import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export async function listMembers(userId: string, projectId: string) {
  await requireRole(userId, projectId);
  return prisma.membership.findMany({
    where: { projectId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });
}
