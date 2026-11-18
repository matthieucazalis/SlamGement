import { auth } from "@/lib/auth";
import { ForbiddenError } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  AdrInUseError,
  AdrLockedError,
  AdrNotFoundError,
  InvalidSupersessionError,
  InvalidTransitionError,
} from "@/services/adr.service";
import { authenticateApiToken } from "@/services/api-token.service";
import { MessageRateLimitError } from "@/services/message.service";
import {
  InvalidAdrError,
  InvalidAssigneeError,
  TaskNotFoundError,
} from "@/services/task.service";

// Format d'erreur unique de l'API : { "error": { "code": "...", "message": "..." } }
export function apiError(status: number, code: string, message: string) {
  return Response.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function apiJson(data: unknown) {
  return Response.json(data, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

type Handler<P> = (ctx: {
  userId: string;
  params: P;
  request: Request;
}) => Promise<Response>;

// Corps JSON d'une requête d'écriture, avec une taille maximale
export async function readJson(
  request: Request,
  maxChars = 20_000,
): Promise<
  | { ok: true; data: unknown }
  | { ok: false; reason: "too_large" | "invalid_json" }
> {
  const text = await request.text();
  if (text.length > maxChars) return { ok: false, reason: "too_large" };
  try {
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}

export function badBody(reason: "too_large" | "invalid_json") {
  return reason === "too_large"
    ? apiError(413, "payload_too_large", "Request body too large.")
    : apiError(400, "invalid_json", "Request body must be valid JSON.");
}

// Erreurs métier → réponses HTTP. Les droits sont déjà vérifiés par les
// services : ici on ne fait que traduire leurs erreurs.
function domainError(e: unknown): Response | null {
  if (e instanceof ForbiddenError || e instanceof AdrNotFoundError)
    // 404 plutôt que 403 : on ne révèle pas l'existence d'un projet
    return apiError(404, "not_found", "Resource not found.");
  if (e instanceof TaskNotFoundError)
    return apiError(404, "not_found", "Resource not found.");
  if (e instanceof MessageRateLimitError)
    return apiError(429, "too_many_requests", "Too many messages. Slow down.");
  if (
    e instanceof AdrLockedError ||
    e instanceof InvalidTransitionError ||
    e instanceof AdrInUseError
  )
    return apiError(
      409,
      "conflict",
      "This change is not allowed in the current state.",
    );
  if (
    e instanceof InvalidSupersessionError ||
    e instanceof InvalidAssigneeError ||
    e instanceof InvalidAdrError
  )
    return apiError(422, "invalid_reference", "A referenced item is invalid.");
  return null;
}

// Enveloppe commune : authentification, compte supprimé, erreurs métier.
//  - Application mobile : en-tête « Authorization: Bearer sgm_… » (jeton révocable).
//  - Navigateur : cookie de session, en LECTURE SEULE. Les écritures exigent un
//    jeton : un cookie est envoyé automatiquement par le navigateur, donc
//    accepter des écritures avec lui exposerait aux attaques CSRF.
export function withUser<P = Record<string, never>>(handler: Handler<P>) {
  return async (
    request: Request,
    context: { params: Promise<P> },
  ): Promise<Response> => {
    const bearer = /^Bearer\s+(\S+)$/i.exec(
      request.headers.get("authorization") ?? "",
    )?.[1];

    let userId: string | null = null;
    if (bearer) {
      userId = await authenticateApiToken(bearer);
    } else {
      const session = await auth();
      const id = session?.user?.id;
      if (id) {
        const account = await prisma.user.findUnique({
          where: { id },
          select: { deletedAt: true },
        });
        if (account && !account.deletedAt) userId = id;
      }
      if (userId && !["GET", "HEAD"].includes(request.method))
        return apiError(
          403,
          "token_required",
          "Write requests require a bearer token.",
        );
    }
    if (!userId)
      return apiError(401, "unauthenticated", "Authentication required.");

    try {
      return await handler({ userId, params: await context.params, request });
    } catch (e) {
      const mapped = domainError(e);
      if (mapped) return mapped;
      console.error("[api]", e);
      return apiError(500, "internal_error", "Unexpected error.");
    }
  };
}
