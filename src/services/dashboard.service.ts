import { ADR_STATUSES, type AdrStatusValue } from "@/lib/adr-status";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function getDashboard(userId: string, projectId: string) {
  const membership = await requireRole(userId, projectId);
  const isAdmin = membership.role === "ADMIN";

  const [grouped, memberCount, recent] = await Promise.all([
    prisma.adr.groupBy({
      by: ["status"],
      where: { projectId },
      _count: { _all: true },
    }),
    prisma.membership.count({ where: { projectId } }),
    prisma.auditLog.findMany({
      where: {
        projectId,
        ...(isAdmin ? {} : { action: { not: "MEMBER_INVITED" } }),
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const byStatus = Object.fromEntries(
    ADR_STATUSES.map((s) => [s, 0]),
  ) as Record<AdrStatusValue, number>;
  for (const row of grouped) byStatus[row.status] = row._count._all;

  const totalAdrs = ADR_STATUSES.reduce((sum, s) => sum + byStatus[s], 0);

  return { byStatus, totalAdrs, memberCount, recent, isAdmin };
}
