import { z } from "zod";
import { apiError, apiJson, badBody, readJson, withUser } from "@/lib/api";
import { ADR_STATUSES } from "@/lib/adr-status";
import { serializeAdr } from "@/lib/api-serializers";
import { parseAdrNumber } from "@/lib/adr-format";
import { changeAdrStatus, getAdr } from "@/services/adr.service";

export const GET = withUser<{ id: string; number: string }>(
  async ({ userId, params }) => {
    const number = parseAdrNumber(params.number);
    if (!number) return apiError(404, "not_found", "Resource not found.");
    return apiJson(serializeAdr(await getAdr(userId, params.id, number)));
  },
);

const statusBody = z.object({
  status: z.enum(ADR_STATUSES),
  replacement: z.number().int().positive().optional(),
});

// Changement de statut (accepter, rejeter…) : les règles de transition sont
// celles du service, identiques au site.
export const PATCH = withUser<{ id: string; number: string }>(
  async ({ userId, params, request }) => {
    const number = parseAdrNumber(params.number);
    if (!number) return apiError(404, "not_found", "Resource not found.");

    const raw = await readJson(request, 500);
    if (!raw.ok) return badBody(raw.reason);
    const parsed = statusBody.safeParse(raw.data);
    if (!parsed.success) return apiError(422, "validation", "Invalid status.");

    const adr = await changeAdrStatus(
      userId,
      params.id,
      number,
      parsed.data.status,
      parsed.data.replacement,
    );
    return apiJson({ number: adr.number, status: adr.status });
  },
);
