"use client";

import { useActionState } from "react";
import type { AdrFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Values = Partial<
  Record<
    | "title"
    | "context"
    | "decision"
    | "consequences"
    | "alternatives"
    | "mermaidCode",
    string
  >
>;

const TEXTAREA_CLASS =
  "min-h-28 w-full rounded-md border bg-transparent px-3 py-2 text-sm";

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

export function AdrForm({
  action,
  initial = {},
  submitLabel,
}: {
  action: (state: AdrFormState, formData: FormData) => Promise<AdrFormState>;
  initial?: Values;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // après une erreur, on réaffiche ce que la personne avait saisi
  const v: Values = state?.values ?? initial;

  return (
    <form action={formAction} className="space-y-5">
      <Field id="title" label="Titre">
        <Input id="title" name="title" defaultValue={v.title} required />
      </Field>

      <Field
        id="context"
        label="Contexte"
        hint="Quel problème, quelles contraintes ? Markdown accepté."
      >
        <textarea
          id="context"
          name="context"
          defaultValue={v.context}
          required
          className={TEXTAREA_CLASS}
        />
      </Field>

      <Field
        id="decision"
        label="Décision"
        hint="Qu'est-ce qui est décidé, et pourquoi ?"
      >
        <textarea
          id="decision"
          name="decision"
          defaultValue={v.decision}
          required
          className={TEXTAREA_CLASS}
        />
      </Field>

      <Field
        id="consequences"
        label="Conséquences"
        hint="Ce que la décision change, en bien comme en mal."
      >
        <textarea
          id="consequences"
          name="consequences"
          defaultValue={v.consequences}
          required
          className={TEXTAREA_CLASS}
        />
      </Field>

      <Field id="alternatives" label="Alternatives étudiées (facultatif)">
        <textarea
          id="alternatives"
          name="alternatives"
          defaultValue={v.alternatives}
          className={TEXTAREA_CLASS}
        />
      </Field>

      <Field
        id="mermaidCode"
        label="Schéma Mermaid (facultatif)"
        hint="Code Mermaid brut. Le rendu graphique arrive en phase 5."
      >
        <textarea
          id="mermaidCode"
          name="mermaidCode"
          defaultValue={v.mermaidCode}
          className={`${TEXTAREA_CLASS} font-mono`}
        />
      </Field>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : submitLabel}
      </Button>
    </form>
  );
}
