import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import type { Locale } from "@/i18n/config";
import { createTranslator } from "@/i18n/translate";
import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAction } from "@/services/audit.service";
import {
  consumePasswordResetQuota,
  resetLoginAttempts,
} from "@/services/rate-limit.service";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

export class InvalidResetTokenError extends Error {}

// Seule l'empreinte du jeton est stockée : une fuite de la base ne permet pas
// de réinitialiser les mots de passe.
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

// Renvoie toujours sans erreur, qu'un compte existe ou non : la réponse ne doit
// pas révéler quels emails sont inscrits (énumération de comptes).
export async function requestPasswordReset(input: {
  email: string;
  ip: string | null;
  locale: Locale;
  baseUrl: string;
}) {
  const blocked = await consumePasswordResetQuota(input.email, input.ip);
  if (blocked) return;

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.deletedAt) return;

  const token = randomBytes(32).toString("hex");
  await prisma.$transaction([
    // un seul jeton valable à la fois
    prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    }),
  ]);

  const t = createTranslator(input.locale);
  await sendMail({
    to: user.email,
    subject: t("email.resetSubject"),
    text: t("email.resetBody", {
      name: user.name,
      link: `${input.baseUrl}/reset-password/${token}`,
      minutes: RESET_TOKEN_TTL_MS / 60000,
    }),
  });
}

async function findValidToken(token: string) {
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { deletedAt: true } } },
  });
  if (!row || row.usedAt || row.expiresAt <= new Date() || row.user.deletedAt)
    return null;
  return row;
}

export async function isResetTokenValid(token: string) {
  return (await findValidToken(token)) !== null;
}

export async function resetPassword(token: string, newPassword: string) {
  const row = await findValidToken(token);
  if (!row) throw new InvalidResetTokenError();

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const user = await prisma.$transaction(async (tx) => {
    // « usedAt: null » dans le where : deux requêtes simultanées avec le même
    // jeton ne peuvent pas réussir toutes les deux
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: row.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) throw new InvalidResetTokenError();

    const updated = await tx.user.update({
      where: { id: row.userId },
      data: { passwordHash },
      select: { id: true, email: true },
    });
    await tx.passwordResetToken.deleteMany({
      where: { userId: row.userId, id: { not: row.id } },
    });
    await logAction(
      {
        userId: updated.id,
        action: AUDIT_ACTIONS.PASSWORD_RESET,
        entityType: "User",
        entityId: updated.id,
      },
      tx,
    );
    return updated;
  });

  // le compte n'est plus verrouillé par d'anciens échecs de connexion
  await resetLoginAttempts(user.email);
}
