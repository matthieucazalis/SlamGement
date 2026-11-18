"use client";

import { useActionState } from "react";
import type { AdrFormState } from "./actions";
import { Markdown } from "@/components/markdown";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/client";
import { useStorage } from "@/hooks/use-storage";

type Values = {
  title: string;
  context: string;
  decision: string;
  consequences: string;
  alternatives: string;
  mermaidCode: string;
};

const EMPTY: Values = {
  title: "",
  context: "",
  decision: "",
  consequences: "",
  alternatives: "",
  mermaidCode: "",
};

// Le brouillon vient du stockage local : on ne fait pas confiance à son contenu
function isValues(value: unknown): value is Values {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (Object.keys(EMPTY) as (keyof Values)[]).every(
    (k) => typeof o[k] === "string",
  );
}

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
  draftKey,
}: {
  action: (state: AdrFormState, formData: FormData) => Promise<AdrFormState>;
  initial?: Partial<Values>;
  submitLabel: string;
  // si fourni, le formulaire est enregistré sur l'appareil au fil de la saisie
  draftKey?: string;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, undefined);
  const {
    value: v,
    setValue: setV,
    reset: discardDraft,
    restored,
  } = useStorage<Values>(
    draftKey ?? "adr-draft:unused",
    { ...EMPTY, ...initial },
    isValues,
    draftKey !== undefined,
  );

  const bind =
    (key: keyof Values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setV((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={formAction} className="space-y-5">
        {draftKey && restored && (
          <p
            className="flex flex-wrap items-center gap-3 rounded-md bg-muted p-2 text-sm"
            role="status"
          >
            {t("adr.form.draftRestored")}
            <button
              type="button"
              className="underline"
              onClick={() => {
                discardDraft();
              }}
            >
              {t("adr.form.draftDiscard")}
            </button>
          </p>
        )}
        <Field id="title" label={t("adr.form.title")}>
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
          label={t("adr.form.context")}
          hint={t("adr.form.contextHint")}
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
          label={t("adr.form.decision")}
          hint={t("adr.form.decisionHint")}
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
          label={t("adr.form.consequences")}
          hint={t("adr.form.consequencesHint")}
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

        <Field id="alternatives" label={t("adr.form.alternatives")}>
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
          label={t("adr.form.mermaid")}
          hint={t("adr.form.mermaidHint")}
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
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? t("adr.form.saving") : submitLabel}
        </Button>
      </form>

      <aside
        aria-label={t("adr.form.preview")}
        className="space-y-4 rounded-lg border p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto"
      >
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {t("adr.form.preview")}
        </p>
        <h3 className="text-xl font-bold">
          {v.title || t("adr.form.previewPlaceholder")}
        </h3>
        <PreviewSection title={t("adr.sectionContext")} text={v.context} />
        <PreviewSection title={t("adr.sectionDecision")} text={v.decision} />
        <PreviewSection
          title={t("adr.sectionConsequences")}
          text={v.consequences}
        />
        <PreviewSection
          title={t("adr.sectionAlternatives")}
          text={v.alternatives}
        />
        {v.mermaidCode.trim() && (
          <section className="space-y-1">
            <h4 className="text-sm font-semibold uppercase text-muted-foreground">
              {t("adr.sectionDiagram")}
            </h4>
            <MermaidDiagram code={v.mermaidCode} />
          </section>
        )}
      </aside>
    </div>
  );
}
