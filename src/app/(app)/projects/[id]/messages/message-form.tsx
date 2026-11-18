"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";
import { MESSAGE_MAX } from "@/lib/validators/chat";
import { sendMessageAction } from "./actions";

export function MessageForm({ projectId }: { projectId: string }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(
    sendMessageAction.bind(null, projectId),
    undefined,
  );
  const ref = useRef<HTMLFormElement>(null);

  // après un envoi réussi, on vide le champ
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-2">
      <label htmlFor="body" className="sr-only">
        {t("chat.placeholder")}
      </label>
      <textarea
        id="body"
        name="body"
        required
        maxLength={MESSAGE_MAX}
        rows={2}
        placeholder={t("chat.placeholder")}
        className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            ref.current?.requestSubmit();
          }
        }}
      />
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        {t("chat.send")}
      </Button>
    </form>
  );
}
