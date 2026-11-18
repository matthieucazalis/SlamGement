import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createProject } from "@/services/project.service";

export const PASSWORD = "motdepasse-de-test";
// coût 4 : suffisant pour les tests, et rapide
const HASH = bcrypt.hashSync(PASSWORD, 4);

export async function makeUser(label = "user") {
  const id = randomUUID().slice(0, 8);
  return prisma.user.create({
    data: {
      name: `${label}-${id}`,
      email: `${label}-${id}@test.local`,
      passwordHash: HASH,
    },
  });
}

// Crée un projet dont `admin` est administrateur
export async function makeProject(adminId: string, name = "Projet de test") {
  return createProject(adminId, { name });
}

export async function addMember(
  projectId: string,
  userId: string,
  role: "ADMIN" | "MEMBER" = "MEMBER",
) {
  return prisma.membership.create({ data: { projectId, userId, role } });
}

export const ADR_INPUT = {
  title: "ADR de test",
  context: "Un contexte suffisamment long",
  decision: "Une décision suffisamment longue",
  consequences: "Des conséquences suffisamment longues",
  alternatives: undefined,
  mermaidCode: undefined,
};

export const taskInput = (
  over: Partial<{
    title: string;
    description: string;
    dueDate: Date;
    assigneeId: string;
    adrId: string;
  }> = {},
) => ({
  title: "Tâche de test",
  description: undefined,
  dueDate: undefined,
  assigneeId: undefined,
  adrId: undefined,
  ...over,
});

export async function cleanup(userIds: string[]) {
  await prisma.project.deleteMany({
    where: { memberships: { some: { userId: { in: userIds } } } },
  });
  await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.rateLimit.deleteMany({
    where: { key: { contains: "@test.local" } },
  });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}
