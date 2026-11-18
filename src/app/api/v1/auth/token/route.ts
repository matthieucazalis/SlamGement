import { z } from "zod";
import { apiError, apiJson, badBody, readJson } from "@/lib/api";
import { normalizeIp } from "@/lib/rate-limit";
import {
  InvalidCredentialsError,
  TooManyAttemptsError,
  issueApiToken,
  revokeApiToken,
} from "@/services/api-token.service";

const body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(72),
  deviceName: z.string().trim().max(60).optional(),
});

// Connexion de l'application mobile : échange email + mot de passe contre un
// jeton. Route publique, protégée par la limitation de tentatives.
export async function POST(request: Request) {
  const raw = await readJson(request, 2_000);
  if (!raw.ok) return badBody(raw.reason);

  const parsed = body.safeParse(raw.data);
  if (!parsed.success)
    return apiError(401, "invalid_credentials", "Invalid credentials.");

  try {
    const result = await issueApiToken({
      email: parsed.data.email,
      password: parsed.data.password,
      ip: normalizeIp(request.headers.get("x-forwarded-for")),
      deviceName: parsed.data.deviceName || "Mobile",
    });
    return apiJson({
      token: result.token,
      expiresAt: result.expiresAt,
      user: result.user,
    });
  } catch (e) {
    if (e instanceof TooManyAttemptsError)
      return apiError(
        429,
        "too_many_attempts",
        "Too many attempts. Try again later.",
      );
    // même réponse pour un email inconnu et un mauvais mot de passe
    if (e instanceof InvalidCredentialsError)
      return apiError(401, "invalid_credentials", "Invalid credentials.");
    console.error("[api]", e);
    return apiError(500, "internal_error", "Unexpected error.");
  }
}

// Déconnexion : le jeton est révoqué côté serveur (pas seulement oublié par le téléphone)
export async function DELETE(request: Request) {
  const bearer = /^Bearer\s+(\S+)$/i.exec(
    request.headers.get("authorization") ?? "",
  )?.[1];
  if (!bearer)
    return apiError(401, "unauthenticated", "Authentication required.");
  await revokeApiToken(bearer);
  return new Response(null, { status: 204 });
}
