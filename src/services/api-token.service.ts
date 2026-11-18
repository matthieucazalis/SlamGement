import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  isLoginBlocked,
  registerLoginFailure,
  resetLoginAttempts,
} from "@/services/rate-limit.service";
import { verifyCredentials } from "@/services/user.service";

export const API_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
export const MAX_TOKENS_PER_USER = 10;
const PREFIX = "sgm_"; // reconnaissable par les outils de détection de secrets

export class TooManyAttemptsError extends Error {}
export class InvalidCredentialsError extends Error {}

// Seule l'empreinte est stockée : une fuite de la base ne donne aucun accès.
export const hashApiToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

// Connexion de l'application mobile : mêmes protections que la connexion web
// (limitation par email et par IP, message identique pour tout échec).
export async function issueApiToken(input: {
  email: string;
  password: string;
  ip: string | null;
  deviceName: string;
}) {
  if (await isLoginBlocked(input.email, input.ip))
    throw new TooManyAttemptsError();

  const user = await verifyCredentials(input.email, input.password);
  if (!user) {
    await registerLoginFailure(input.email, input.ip);
    throw new InvalidCredentialsError();
  }
  await resetLoginAttempts(input.email);

  const token = PREFIX + randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + API_TOKEN_TTL_MS);

  await prisma.$transaction(async (tx) => {
    await tx.apiToken.create({
      data: {
        userId: user.id,
        tokenHash: hashApiToken(token),
        name: input.deviceName.slice(0, 60),
        expiresAt,
      },
    });
    // on garde les plus récents : un appareil perdu finit par être oublié
    const old = await tx.apiToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: MAX_TOKENS_PER_USER,
      select: { id: true },
    });
    if (old.length)
      await tx.apiToken.deleteMany({
        where: { id: { in: old.map((t) => t.id) } },
      });
  });

  return {
    token,
    expiresAt,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

// Renvoie l'identifiant de l'utilisateur, ou null si le jeton est inconnu,
// expiré, révoqué, ou si le compte a été supprimé.
export async function authenticateApiToken(token: string) {
  if (!token.startsWith(PREFIX) || token.length > 200) return null;
  const row = await prisma.apiToken.findUnique({
    where: { tokenHash: hashApiToken(token) },
    include: { user: { select: { deletedAt: true } } },
  });
  if (!row || row.expiresAt <= new Date() || row.user.deletedAt) return null;

  // « dernière utilisation » : au plus une écriture toutes les 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (!row.lastUsedAt || row.lastUsedAt < fiveMinutesAgo)
    await prisma.apiToken.update({
      where: { id: row.id },
      data: { lastUsedAt: new Date() },
    });

  return row.userId;
}

export async function revokeApiToken(token: string) {
  await prisma.apiToken.deleteMany({
    where: { tokenHash: hashApiToken(token) },
  });
}
