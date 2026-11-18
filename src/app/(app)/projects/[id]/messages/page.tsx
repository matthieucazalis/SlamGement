import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { displayName } from "@/lib/labels";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { MESSAGES_MAX, listMessages } from "@/services/message.service";
import { AutoRefresh } from "./auto-refresh";
import { MessageForm } from "./message-form";
import { MessagesList } from "./messages-list";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, t] = await Promise.all([requireUser(), getT()]);

  let messages;
  try {
    messages = await listMessages(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  return (
    <main className="mx-auto max-w-2xl space-y-3 p-4 sm:p-8">
      <AutoRefresh />
      <h1 className="text-2xl font-bold">{t("chat.title")}</h1>

      <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
          <p className="text-xs text-muted-foreground">{t("chat.limitNote")}</p>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {messages.length} / {MESSAGES_MAX}
          </span>
        </div>

        <MessagesList
          messages={messages.map((m) => ({
            id: m.id,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
            author: displayName(t, m.author.name),
            mine: m.author.id === user.id,
          }))}
        />

        <div className="border-t p-3">
          <MessageForm projectId={id} />
        </div>
      </section>
    </main>
  );
}
