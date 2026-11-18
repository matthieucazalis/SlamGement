import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { MessageInput } from "@/lib/validators/chat";
import { WINDOW_MS } from "@/lib/rate-limit";
import { consumeQuota } from "@/services/rate-limit.service";

export class MessageRateLimitError extends Error {}

export const MESSAGE_LIMITS = {
  perMinute: 15,
  perWindow: 80,
} as const;

export const MESSAGES_MAX = 50;

export async function listMessages(userId: string, projectId: string) {
  await requireRole(userId, projectId);
  const rows = await prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: MESSAGES_MAX,
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: { id: true, name: true, deletedAt: true } },
    },
  });
  return rows.reverse();
}

export async function sendMessage(
  userId: string,
  projectId: string,
  input: MessageInput,
) {
  await requireRole(userId, projectId);

  const [tooFast, tooMany] = await Promise.all([
    consumeQuota(`chat:min:${userId}`, MESSAGE_LIMITS.perMinute, 60_000),
    consumeQuota(`chat:win:${userId}`, MESSAGE_LIMITS.perWindow, WINDOW_MS),
  ]);
  if (tooFast || tooMany) throw new MessageRateLimitError();

  const created = await prisma.message.create({
    data: { projectId, authorId: userId, body: input.body },
    select: { id: true },
  });

  const surplus = await prisma.message.findMany({
    where: { projectId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: MESSAGES_MAX,
    select: { id: true },
  });
  if (surplus.length > 0) {
    await prisma.message.deleteMany({
      where: { id: { in: surplus.map((m) => m.id) } },
    });
  }
  return created;
}
