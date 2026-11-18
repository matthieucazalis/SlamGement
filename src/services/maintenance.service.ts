import { prisma } from "@/lib/prisma";
import { purgeExpiredRateLimits } from "@/services/rate-limit.service";

const DAY = 24 * 60 * 60 * 1000;

// Principe de minimisation (RGPD) : on ne garde pas les données techniques
// dont on n'a plus besoin. Pas de tâche planifiée à gérer : le ménage est
// déclenché de temps en temps par l'activité normale (connexion, demande de
// réinitialisation), voir maybePurge().
export async function purgeExpiredData(now = new Date()) {
  const [rateLimits, resetTokens, invitations, apiTokens] = await Promise.all([
    purgeExpiredRateLimits(),
    // jetons expirés depuis plus d'un jour, ou déjà utilisés
    prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date(now.getTime() - DAY) } },
          { usedAt: { not: null } },
        ],
      },
    }),
    // invitations expirées depuis plus de 30 jours
    prisma.invitation.deleteMany({
      where: { expiresAt: { lt: new Date(now.getTime() - 30 * DAY) } },
    }),
    prisma.apiToken.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);

  return {
    rateLimits,
    resetTokens: resetTokens.count,
    invitations: invitations.count,
    apiTokens: apiTokens.count,
  };
}

// Environ une fois sur vingt : assez pour que les tables restent petites, trop
// peu pour se voir dans les temps de réponse. Ne bloque jamais l'appelant.
export function maybePurge(probability = 0.05) {
  if (Math.random() >= probability) return;
  void purgeExpiredData().catch((e) => console.error("[purge]", e));
}
