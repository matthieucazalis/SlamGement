import { createHash, randomBytes } from "node:crypto";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { AUDIT_ACTIONS, logAction } from "@/services/audit.service";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export class AlreadyMemberError extends Error {}
export class InvalidInvitationError extends Error {}
export class EmailMismatchError extends Error {}

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function createInvitation(
  actorId: string,
  projectId: string,
  email: string,
  role: Role,
) {
  await requireRole(actorId, projectId, "ADMIN");

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    const membership = await prisma.membership.findUnique({
      where: { userId_projectId: { userId: existingUser.id, projectId } },
    });
    if (membership) throw new AlreadyMemberError();
  }

  const token = randomBytes(32).toString("base64url");

  await prisma.$transaction(async (tx) => {
    await tx.invitation.deleteMany({
      where: { projectId, email, acceptedAt: null },
    });
    const invitation = await tx.invitation.create({
      data: {
        projectId,
        email,
        role,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      },
    });
    await logAction(
      {
        userId: actorId,
        projectId,
        action: AUDIT_ACTIONS.MEMBER_INVITED,
        entityType: "Invitation",
        entityId: invitation.id,
        metadata: { email, role },
      },
      tx,
    );
  });

  return token;
}

export async function getInvitationByToken(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date())
    return null;
  return invitation;
}

export async function acceptInvitation(
  userId: string,
  userEmail: string,
  token: string,
) {
  return prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.expiresAt < new Date()
    )
      throw new InvalidInvitationError();

    if (invitation.email !== userEmail.toLowerCase())
      throw new EmailMismatchError();

    const claimed = await tx.invitation.updateMany({
      where: { id: invitation.id, acceptedAt: null },
      data: { acceptedAt: new Date() },
    });
    if (claimed.count === 0) throw new InvalidInvitationError();

    const existing = await tx.membership.findUnique({
      where: {
        userId_projectId: { userId, projectId: invitation.projectId },
      },
    });
    if (!existing) {
      await tx.membership.create({
        data: {
          userId,
          projectId: invitation.projectId,
          role: invitation.role,
        },
      });
    }

    await logAction(
      {
        userId,
        projectId: invitation.projectId,
        action: AUDIT_ACTIONS.MEMBER_JOINED,
        entityType: "Invitation",
        entityId: invitation.id,
        metadata: { role: invitation.role },
      },
      tx,
    );

    return invitation.projectId;
  });
}
