import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import {
  canTransition,
  isContentEditable,
  type AdrStatusValue,
} from "@/lib/adr-status";
import type { AdrInput } from "@/lib/validators/adr";
import { AUDIT_ACTIONS, logAction } from "@/services/audit.service";

export class AdrNotFoundError extends Error {}
export class AdrLockedError extends Error {}
export class InvalidTransitionError extends Error {}
export class InvalidSupersessionError extends Error {}
export class AdrInUseError extends Error {}

export async function listAdrs(
  userId: string,
  projectId: string,
  status?: AdrStatusValue,
) {
  await requireRole(userId, projectId);
  return prisma.adr.findMany({
    where: { projectId, ...(status ? { status } : {}) },
    include: { author: { select: { name: true } } },
    orderBy: { number: "desc" },
  });
}

export async function getAdr(
  userId: string,
  projectId: string,
  number: number,
) {
  await requireRole(userId, projectId);
  const adr = await prisma.adr.findUnique({
    where: { projectId_number: { projectId, number } },
    include: {
      author: { select: { name: true } },
      supersededBy: { select: { number: true, title: true } },
      supersedes: { select: { number: true, title: true } },
    },
  });
  if (!adr) throw new AdrNotFoundError();
  return adr;
}

export async function createAdr(
  userId: string,
  projectId: string,
  input: AdrInput,
) {
  await requireRole(userId, projectId);

  return prisma.$transaction(async (tx) => {
    // Le compteur est incrémenté de façon atomique (verrou de ligne) : deux
    // créations simultanées obtiennent deux numéros différents, et un numéro
    // n'est jamais réattribué après une suppression.
    const { adrCounter: number } = await tx.project.update({
      where: { id: projectId },
      data: { adrCounter: { increment: 1 } },
      select: { adrCounter: true },
    });

    const adr = await tx.adr.create({
      data: { projectId, number, authorId: userId, ...input },
    });

    await logAction(
      {
        userId,
        projectId,
        action: AUDIT_ACTIONS.ADR_CREATED,
        entityType: "Adr",
        entityId: adr.id,
        metadata: { number: adr.number, title: adr.title },
      },
      tx,
    );
    return adr;
  });
}

export async function updateAdr(
  userId: string,
  projectId: string,
  number: number,
  input: AdrInput,
) {
  await requireRole(userId, projectId);

  return prisma.$transaction(async (tx) => {
    const adr = await tx.adr.findUnique({
      where: { projectId_number: { projectId, number } },
    });
    if (!adr) throw new AdrNotFoundError();
    if (!isContentEditable(adr.status)) throw new AdrLockedError();

    const changedFields = (Object.keys(input) as (keyof AdrInput)[]).filter(
      (k) => (input[k] ?? null) !== (adr[k] ?? null),
    );

    const updated = await tx.adr.update({
      where: { id: adr.id },
      data: {
        title: input.title,
        context: input.context,
        decision: input.decision,
        consequences: input.consequences,
        alternatives: input.alternatives ?? null,
        mermaidCode: input.mermaidCode ?? null,
      },
    });

    await logAction(
      {
        userId,
        projectId,
        action: AUDIT_ACTIONS.ADR_UPDATED,
        entityType: "Adr",
        entityId: adr.id,
        metadata: { number, fields: changedFields },
      },
      tx,
    );
    return updated;
  });
}

export async function changeAdrStatus(
  userId: string,
  projectId: string,
  number: number,
  newStatus: AdrStatusValue,
  replacementNumber?: number,
) {
  await requireRole(userId, projectId);

  return prisma.$transaction(async (tx) => {
    const adr = await tx.adr.findUnique({
      where: { projectId_number: { projectId, number } },
    });
    if (!adr) throw new AdrNotFoundError();

    if (!canTransition(adr.status, newStatus))
      throw new InvalidTransitionError(`${adr.status} → ${newStatus}`);

    let supersededById: string | null = null;
    if (newStatus === "SUPERSEDED") {
      if (!replacementNumber || replacementNumber === number)
        throw new InvalidSupersessionError();

      const replacement = await tx.adr.findUnique({
        where: { projectId_number: { projectId, number: replacementNumber } },
      });
      // un ADR rejeté, déprécié ou déjà remplacé ne peut pas en remplacer un autre
      if (
        !replacement ||
        replacement.status === "REJECTED" ||
        replacement.status === "DEPRECATED" ||
        replacement.status === "SUPERSEDED"
      )
        throw new InvalidSupersessionError();

      const taken = await tx.adr.findFirst({
        where: { supersededById: replacement.id },
      });
      if (taken) throw new InvalidSupersessionError();

      supersededById = replacement.id;
    }

    const updated = await tx.adr.update({
      where: { id: adr.id },
      data: { status: newStatus, supersededById },
    });

    await logAction(
      {
        userId,
        projectId,
        action: AUDIT_ACTIONS.ADR_STATUS_CHANGED,
        entityType: "Adr",
        entityId: adr.id,
        metadata: {
          number,
          from: adr.status,
          to: newStatus,
          ...(replacementNumber ? { supersededBy: replacementNumber } : {}),
        },
      },
      tx,
    );
    return updated;
  });
}

export async function deleteAdr(
  userId: string,
  projectId: string,
  number: number,
) {
  await requireRole(userId, projectId, "ADMIN");

  await prisma.$transaction(async (tx) => {
    const adr = await tx.adr.findUnique({
      where: { projectId_number: { projectId, number } },
    });
    if (!adr) throw new AdrNotFoundError();

    const replaces = await tx.adr.findFirst({
      where: { supersededById: adr.id },
    });
    if (replaces) throw new AdrInUseError();

    await logAction(
      {
        userId,
        projectId,
        action: AUDIT_ACTIONS.ADR_DELETED,
        entityType: "Adr",
        entityId: adr.id,
        metadata: { number, title: adr.title },
      },
      tx,
    );
    await tx.adr.delete({ where: { id: adr.id } });
  });
}

export async function listAdrsForExport(userId: string, projectId: string) {
  await requireRole(userId, projectId);
  return prisma.adr.findMany({
    where: { projectId },
    include: {
      author: { select: { name: true } },
      supersededBy: { select: { number: true, title: true } },
      supersedes: { select: { number: true, title: true } },
    },
    orderBy: { number: "asc" },
  });
}
