import { prisma } from "@/lib/prisma";
import {
  LOGIN_LIMITS,
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

async function increment(key: string) {
  const row = await prisma.rateLimit.findUnique({ where: { key } });
  const now = new Date();

  if (!row || isWindowExpired(row.windowStart, now)) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
  } else {
    await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
  }
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
