import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  consumePasswordResetQuota,
  isLoginBlocked,
  purgeExpiredRateLimits,
  registerLoginFailure,
} from "@/services/rate-limit.service";
import {
  EmailTakenError,
  registerUser,
  verifyCredentials,
} from "@/services/user.service";
import {
  InvalidResetTokenError,
  hashToken,
  isResetTokenValid,
  requestPasswordReset,
  resetPassword,
} from "@/services/password-reset.service";
import { purgeExpiredData } from "@/services/maintenance.service";
import { PASSWORD, cleanup, makeProject, makeUser } from "./helpers";

// On intercepte l'envoi pour récupérer le lien contenu dans l'e-mail
const sent = vi.hoisted(
  () => [] as { to: string; subject: string; text: string }[],
);
vi.mock("@/lib/mail", () => ({
  sendMail: async (mail: { to: string; subject: string; text: string }) => {
    sent.push(mail);
  },
}));

const tokenFrom = (mail: { text: string }) =>
  /\/reset-password\/([0-9a-f]{64})/.exec(mail.text)?.[1] ?? "";

describe("ménage des données expirées", () => {
  it("supprime jetons et invitations périmés, garde les valables", async () => {
    const user = await makeUser("purge");
    const project = await makeProject(user.id);
    const old = new Date(Date.now() - 40 * 24 * 3600 * 1000);
    const future = new Date(Date.now() + 3600 * 1000);

    await prisma.passwordResetToken.createMany({
      data: [
        { userId: user.id, tokenHash: `old-${Date.now()}`, expiresAt: old },
        { userId: user.id, tokenHash: `live-${Date.now()}`, expiresAt: future },
      ],
    });
    await prisma.invitation.createMany({
      data: [
        {
          projectId: project.id,
          email: "a@test.local",
          tokenHash: `i-old-${Date.now()}`,
          expiresAt: old,
        },
        {
          projectId: project.id,
          email: "b@test.local",
          tokenHash: `i-live-${Date.now()}`,
          expiresAt: future,
        },
      ],
    });

    const result = await purgeExpiredData();
    expect(result.resetTokens).toBeGreaterThanOrEqual(1);
    expect(result.invitations).toBeGreaterThanOrEqual(1);
    expect(
      await prisma.passwordResetToken.count({ where: { userId: user.id } }),
    ).toBe(1);
    expect(
      await prisma.invitation.count({ where: { projectId: project.id } }),
    ).toBe(1);

    await cleanup([user.id]);
  });
});

describe("authentification", () => {
  const created: string[] = [];
  afterAll(() => cleanup(created));
  beforeEach(() => {
    sent.length = 0;
  });

  it("compte exactement les échecs de connexion simultanés, puis bloque", async () => {
    const email = `rl-${Date.now()}@test.local`;
    await Promise.all(
      Array.from({ length: 12 }, () =>
        registerLoginFailure(email, "203.0.113.9"),
      ),
    );
    const row = await prisma.rateLimit.findUniqueOrThrow({
      where: { key: `login:email:${email}` },
    });
    expect(row.count).toBe(12);
    expect(await isLoginBlocked(email, null)).toBe(true);
  });

  it("purge les compteurs expirés mais garde les actifs", async () => {
    const old = `login:email:old-${Date.now()}@test.local`;
    const fresh = `login:email:fresh-${Date.now()}@test.local`;
    await prisma.rateLimit.create({
      data: {
        key: old,
        count: 3,
        windowStart: new Date(Date.now() - 3_600_000),
      },
    });
    await prisma.rateLimit.create({
      data: { key: fresh, count: 1, windowStart: new Date() },
    });

    expect(await purgeExpiredRateLimits()).toBeGreaterThanOrEqual(1);
    expect(
      await prisma.rateLimit.findUnique({ where: { key: old } }),
    ).toBeNull();
    expect(
      await prisma.rateLimit.findUnique({ where: { key: fresh } }),
    ).not.toBeNull();
  });

  it("deux inscriptions simultanées avec le même email : une seule réussit", async () => {
    const email = `dup-${Date.now()}@test.local`;
    const results = await Promise.allSettled(
      [1, 2, 3].map(() =>
        registerUser({ name: "Dup", email, password: PASSWORD }),
      ),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    for (const r of results)
      if (r.status === "rejected")
        expect(r.reason).toBeInstanceOf(EmailTakenError);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) created.push(user.id);
  });

  describe("réinitialisation du mot de passe", () => {
    const request = (email: string, ip: string | null = null) =>
      requestPasswordReset({
        email,
        ip,
        locale: "fr",
        baseUrl: "https://app.test",
      });

    it("envoie un lien, stocke seulement l'empreinte du jeton, et ne sert qu'une fois", async () => {
      const user = await makeUser("reset");
      created.push(user.id);

      await request(user.email);
      expect(sent).toHaveLength(1);
      expect(sent[0].to).toBe(user.email);
      expect(sent[0].text).toContain("https://app.test/reset-password/");

      const token = tokenFrom(sent[0]);
      expect(token).toHaveLength(64);
      // le jeton n'est jamais stocké en clair
      const rows = await prisma.passwordResetToken.findMany({
        where: { userId: user.id },
      });
      expect(rows).toHaveLength(1);
      expect(rows[0].tokenHash).toBe(hashToken(token));
      expect(rows[0].tokenHash).not.toBe(token);

      expect(await isResetTokenValid(token)).toBe(true);
      await resetPassword(token, "nouveau-mot-de-passe");

      expect(
        await verifyCredentials(user.email, "nouveau-mot-de-passe"),
      ).not.toBeNull();
      expect(await verifyCredentials(user.email, PASSWORD)).toBeNull();
      // usage unique
      await expect(resetPassword(token, "autre-mot-de-passe")).rejects.toThrow(
        InvalidResetTokenError,
      );
    });

    it("ne révèle pas si un compte existe (aucun e-mail, aucune erreur)", async () => {
      await expect(request("inconnu@test.local")).resolves.toBeUndefined();
      expect(sent).toHaveLength(0);
    });

    it("n'accepte qu'un jeton valable à la fois", async () => {
      const user = await makeUser("reset");
      created.push(user.id);
      await request(user.email);
      const first = tokenFrom(sent[0]);
      await request(user.email);
      const second = tokenFrom(sent[1]);

      expect(await isResetTokenValid(first)).toBe(false);
      expect(await isResetTokenValid(second)).toBe(true);
    });

    it("refuse un jeton expiré", async () => {
      const user = await makeUser("reset");
      created.push(user.id);
      await request(user.email);
      const token = tokenFrom(sent[0]);
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      await expect(
        resetPassword(token, "nouveau-mot-de-passe"),
      ).rejects.toThrow(InvalidResetTokenError);
    });

    it("refuse un jeton inventé", async () => {
      expect(await isResetTokenValid("a".repeat(64))).toBe(false);
      await expect(
        resetPassword("a".repeat(64), "nouveau-mot-de-passe"),
      ).rejects.toThrow(InvalidResetTokenError);
    });

    it("deux utilisations simultanées du même jeton : une seule réussit", async () => {
      const user = await makeUser("reset");
      created.push(user.id);
      await request(user.email);
      const token = tokenFrom(sent[0]);

      const results = await Promise.allSettled([
        resetPassword(token, "mot-de-passe-un"),
        resetPassword(token, "mot-de-passe-deux"),
      ]);
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    });

    it("limite les demandes répétées pour une même adresse", async () => {
      const user = await makeUser("reset");
      created.push(user.id);
      for (let i = 0; i < 5; i++) await request(user.email);
      // seules les 3 premières demandes envoient un e-mail
      expect(sent).toHaveLength(3);
    });

    it("compte aussi les demandes pour des adresses inconnues (pas de fuite)", async () => {
      const email = `ghost-${Date.now()}@test.local`;
      const blocked: boolean[] = [];
      for (let i = 0; i < 5; i++)
        blocked.push(await consumePasswordResetQuota(email, null));
      expect(blocked).toEqual([false, false, false, true, true]);
    });

    it("la réinitialisation débloque un compte verrouillé par des échecs", async () => {
      const user = await makeUser("reset");
      created.push(user.id);
      for (let i = 0; i < 6; i++) await registerLoginFailure(user.email, null);
      expect(await isLoginBlocked(user.email, null)).toBe(true);

      await request(user.email);
      await resetPassword(tokenFrom(sent[0]), "nouveau-mot-de-passe");
      expect(await isLoginBlocked(user.email, null)).toBe(false);
    });
  });
});
