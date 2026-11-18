"use client";

import { useEffect, useRef } from "react";
import { useLocale, useT } from "@/i18n/client";

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string; // date ISO
  author: string;
  mine: boolean;
};

// Zone de messages à hauteur fixe : seule cette zone défile, et elle reste
// calée sur le message le plus récent.
export function MessagesList({ messages }: { messages: ChatMessage[] }) {
  const t = useT();
  const locale = useLocale();
  const ref = useRef<HTMLUListElement>(null);
  const lastId = messages.at(-1)?.id;

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastId]);

  const format = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ul
      ref={ref}
      aria-live="polite"
      aria-label={t("chat.title")}
      className="flex h-[26rem] flex-col gap-2 overflow-y-auto bg-muted/30 p-3 sm:h-[30rem]"
    >
      {messages.length === 0 && (
        <li className="m-auto text-sm text-muted-foreground">
          {t("chat.empty")}
        </li>
      )}
      {messages.map((m) => (
        <li
          key={m.id}
          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
            m.mine
              ? "ml-auto rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm border bg-background"
          }`}
        >
          <p
            className={`mb-0.5 text-[11px] ${
              m.mine ? "opacity-80" : "text-muted-foreground"
            }`}
          >
            {m.author} · {format.format(new Date(m.createdAt))}
          </p>
          {/* texte brut : React l'échappe, aucun HTML/Markdown interprété */}
          <p className="whitespace-pre-wrap break-words">{m.body}</p>
        </li>
      ))}
    </ul>
  );
}
