"use server";

import { revalidatePath } from "next/cache";
import { getT } from "@/i18n/server";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { messageSchema } from "@/lib/validators/chat";
import { firstIssueMessage } from "@/lib/validators/messages";
import {
  MessageRateLimitError,
  sendMessage,
} from "@/services/message.service";

export type MessageFormState = { error?: string; ok?: number } | undefined;

export async function sendMessageAction(
  projectId: string,
  _prev: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const [user, t] = await Promise.all([requireUser(), getT()]);

  // seul le champ « body » est lu : tout autre champ envoyé est ignoré
  const parsed = messageSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { error: firstIssueMessage(t, parsed.error) };

  try {
    await sendMessage(user.id, projectId, parsed.data);
  } catch (e) {
    if (e instanceof ForbiddenError) return { error: t("errors.forbidden") };
    if (e instanceof MessageRateLimitError)
      return { error: t("errors.tooManyMessages") };
    throw e;
  }
  revalidatePath(`/projects/${projectId}/messages`);
  return { ok: Date.now() };
}
