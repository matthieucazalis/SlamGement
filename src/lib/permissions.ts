import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class ForbiddenError extends Error {}

export async function requireRole(
  userId: string,
  projectId: string,
  minRole: Role = "MEMBER",
) {
  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) throw new ForbiddenError();
  if (minRole === "ADMIN" && membership.role !== "ADMIN")
    throw new ForbiddenError();

  return membership;
}
