import { apiJson, badBody, readJson, withUser } from "@/lib/api";
import { messageSchema } from "@/lib/validators/chat";
import { listMessages, sendMessage } from "@/services/message.service";

export const GET = withUser<{ id: string }>(async ({ userId, params }) => {
  const messages = await listMessages(userId, params.id);
  return apiJson({
    data: messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      author: { id: m.author.id, name: m.author.name },
      mine: m.author.id === userId,
    })),
  });
});

export const POST = withUser<{ id: string }>(
  async ({ userId, params, request }) => {
    const raw = await readJson(request, 6_000);
    if (!raw.ok) return badBody(raw.reason);

    const body =
      raw.data && typeof raw.data === "object"
        ? (raw.data as Record<string, unknown>).body
        : undefined;
    const parsed = messageSchema.safeParse({ body });
    if (!parsed.success)
      return Response.json(
        {
          error: {
            code: "validation",
            message: "Invalid data.",
            fields: ["body"],
          },
        },
        { status: 422, headers: { "Cache-Control": "no-store" } },
      );

    const message = await sendMessage(userId, params.id, parsed.data);
    return Response.json(
      { id: message.id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  },
);
