import { prisma } from "@/lib/prisma";
import {
  LOGIN_LIMITS,
  WINDOW_MS,
  isLimitReached,
  isWindowExpired,
} from "@/lib/rate-limit";

const emailKey = (email: string) => `login:email:${email.toLowerCase()}`;
const ipKey = (ip: string) => `login:ip:${ip}`;

async function currentCount(key: string) {
  const row = await prisma.rateLimit.findUnique({ where: { key } });
  if (!row || isWindowExpired(row.windowStart)) return 0;
  return row.count;
}

// Une seule requête SQL atomique : lire puis écrire en deux temps laisserait
// passer des tentatives en rafale (chacune lirait le même compteur).
async function increment(key: string) {
  const now = new Date();
  const expiredBefore = new Date(now.getTime() - WINDOW_MS);
  await prisma.$executeRaw`
    INSERT INTO "RateLimit" ("key", "count", "windowStart")
    VALUES (${key}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimit"."windowStart" <= ${expiredBefore} THEN 1
        ELSE "RateLimit"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimit"."windowStart" <= ${expiredBefore} THEN ${now}
        ELSE "RateLimit"."windowStart"
      END`;
}

export async function isLoginBlocked(email: string, ip: string | null) {
  const [byEmail, byIp] = await Promise.all([
    currentCount(emailKey(email)),
    ip ? currentCount(ipKey(ip)) : Promise.resolve(0),
  ]);
  return (
    isLimitReached(byEmail, LOGIN_LIMITS.perEmail) ||
    isLimitReached(byIp, LOGIN_LIMITS.perIp)
  );
}

export async function registerLoginFailure(email: string, ip: string | null) {
  await Promise.all([
    increment(emailKey(email)),
    ip ? increment(ipKey(ip)) : Promise.resolve(),
  ]);
}

// Une connexion réussie remet à zéro le compteur de l'email (pas celui de l'IP).
export async function resetLoginAttempts(email: string) {
  await prisma.rateLimit.deleteMany({ where: { key: emailKey(email) } });
}
