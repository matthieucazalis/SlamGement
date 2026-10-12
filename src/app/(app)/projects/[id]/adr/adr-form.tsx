"use client";

import { useActionState, useState } from "react";
import type { AdrFormState } from "./actions";
import { Markdown } from "@/components/markdown";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Values = {
  title: string;
  context: string;
  decision: string;
  consequences: string;
  alternatives: string;
  mermaidCode: string;
};

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

function PreviewSection({ title, text }: { title: string; text: string }) {
  if (!text.trim()) return null;
  return (
    <section className="space-y-1">
      <h4 className="text-sm font-semibold uppercase text-muted-foreground">
        {title}
      </h4>
      <Markdown>{text}</Markdown>
    </section>
  );
}

export function AdrForm({
  action,
  initial = {},
  submitLabel,
}: {
  action: (state: AdrFormState, formData: FormData) => Promise<AdrFormState>;
  initial?: Partial<Values>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [v, setV] = useState<Values>({
    title: initial.title ?? "",
    context: initial.context ?? "",
    decision: initial.decision ?? "",
    consequences: initial.consequences ?? "",
    alternatives: initial.alternatives ?? "",
    mermaidCode: initial.mermaidCode ?? "",
  });

  const bind =
    (key: keyof Values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setV((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={formAction} className="space-y-5">
        <Field id="title" label="Titre">
          <Input
            id="title"
            name="title"
            value={v.title}
            onChange={bind("title")}
            required
          />
        </Field>

        <Field
          id="context"
          label="Contexte"
          hint="Quel problème, quelles contraintes ? Markdown accepté."
        >
          <textarea
            id="context"
            name="context"
            value={v.context}
            onChange={bind("context")}
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
            value={v.decision}
            onChange={bind("decision")}
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
            value={v.consequences}
            onChange={bind("consequences")}
            required
            className={TEXTAREA_CLASS}
          />
        </Field>

        <Field id="alternatives" label="Alternatives étudiées (facultatif)">
          <textarea
            id="alternatives"
            name="alternatives"
            value={v.alternatives}
            onChange={bind("alternatives")}
            className={TEXTAREA_CLASS}
          />
        </Field>

        <Field
          id="mermaidCode"
          label="Schéma Mermaid (facultatif)"
          hint="Exemple : graph TD; A[Client] --> B[API]; B --> C[(Base)]"
        >
          <textarea
            id="mermaidCode"
            name="mermaidCode"
            value={v.mermaidCode}
            onChange={bind("mermaidCode")}
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

      <aside
        aria-label="Aperçu"
        className="space-y-4 rounded-lg border p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto"
      >
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Aperçu
        </p>
        <h3 className="text-xl font-bold">{v.title || "Titre de l'ADR"}</h3>
        <PreviewSection title="Contexte" text={v.context} />
        <PreviewSection title="Décision" text={v.decision} />
        <PreviewSection title="Conséquences" text={v.consequences} />
        <PreviewSection title="Alternatives" text={v.alternatives} />
        {v.mermaidCode.trim() && (
          <section className="space-y-1">
            <h4 className="text-sm font-semibold uppercase text-muted-foreground">
              Schéma
            </h4>
            <MermaidDiagram code={v.mermaidCode} />
          </section>
        )}
      </aside>
    </div>
  );
}
