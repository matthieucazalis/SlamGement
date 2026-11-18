"use client";

import { useActionState } from "react";
import { formatAdrNumber } from "@/lib/adr-format";
import type { TaskFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/client";

type Initial = {
  title?: string;
  description?: string;
  dueDate?: string;
  assigneeId?: string;
  adrId?: string;
};

const FIELD_CLASS = "w-full rounded-md border bg-transparent px-3 py-2 text-sm";

export function TaskForm({
  action,
  members,
  adrs,
  initial = {},
  submitLabel,
}: {
  action: (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  members: { id: string; name: string }[];
  adrs: { id: string; number: number; title: string }[];
  initial?: Initial;
  submitLabel: string;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, undefined);
  // Après une erreur, on réaffiche la saisie. La clé force le formulaire à
  // repartir des bonnes valeurs (React vide sinon les champs après l'envoi).
  const v: Initial = state?.values ?? initial;

  return (
    <form key={JSON.stringify(v)} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{t("kanban.form.title")}</Label>
        <Input id="title" name="title" defaultValue={v.title} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("kanban.form.description")}</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={v.description}
          className={`${FIELD_CLASS} min-h-24`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueDate">{t("kanban.form.dueDate")}</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={v.dueDate}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assigneeId">{t("kanban.form.assignee")}</Label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue={v.assigneeId ?? ""}
            className={`${FIELD_CLASS} h-9 py-0`}
          >
            <option value="">{t("kanban.form.nobody")}</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adrId">{t("kanban.form.adr")}</Label>
        <select
          id="adrId"
          name="adrId"
          defaultValue={v.adrId ?? ""}
          className={`${FIELD_CLASS} h-9 py-0`}
        >
          <option value="">{t("kanban.form.noAdr")}</option>
          {adrs.map((a) => (
            <option key={a.id} value={a.id}>
              ADR-{formatAdrNumber(a.number)} : {a.title}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? t("kanban.form.saving") : submitLabel}
      </Button>
    </form>
  );
}
