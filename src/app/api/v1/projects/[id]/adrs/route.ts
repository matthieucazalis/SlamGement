import { z } from "zod";
import { apiError, apiJson, badBody, readJson, withUser } from "@/lib/api";
import { serializeAdrSummary } from "@/lib/api-serializers";
import { ADR_STATUSES } from "@/lib/adr-status";
import { adrSchema } from "@/lib/validators/adr";
import { createAdr, listAdrs } from "@/services/adr.service";

const query = z.object({
  status: z.enum(ADR_STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
});

export const GET = withUser<{ id: string }>(
  async ({ userId, params, request }) => {
    const parsed = query.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!parsed.success)
      return apiError(400, "invalid_query", "Invalid query parameters.");

    const adrs = await listAdrs(
      userId,
      params.id,
      parsed.data.status,
      parsed.data.q,
    );
    return apiJson({ data: adrs.map(serializeAdrSummary) });
  },
);

// Création d'un ADR depuis l'application. Mêmes règles de validation que le site.
export const POST = withUser<{ id: string }>(
  async ({ userId, params, request }) => {
    const raw = await readJson(request, 40_000);
    if (!raw.ok) return badBody(raw.reason);

    const parsed = adrSchema.safeParse(raw.data);
    if (!parsed.success)
      return Response.json(
        {
          error: {
            code: "validation",
            message: "Invalid data.",
            fields: [
              ...new Set(parsed.error.issues.map((i) => String(i.path[0]))),
            ],
          },
        },
        { status: 422, headers: { "Cache-Control": "no-store" } },
      );

    const adr = await createAdr(userId, params.id, parsed.data);
    return Response.json(
      { number: adr.number, title: adr.title, status: adr.status },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  },
);
