import Link from "next/link";
import { notFound } from "next/navigation";
import { AdrStatusBadge } from "@/components/adr-status-badge";
import { formatAdrNumber, parseAdrNumber } from "@/lib/adr-format";
import {
  allowedTransitions,
  isContentEditable,
  type AdrStatusValue,
} from "@/lib/adr-status";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { AdrNotFoundError, getAdr } from "@/services/adr.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changeStatusAction } from "../actions";

const ACTION_LABELS: Record<AdrStatusValue, string> = {
  PROPOSED: "Remettre en proposition",
  ACCEPTED: "Accepter",
  REJECTED: "Rejeter",
  DEPRECATED: "Déprécier",
  SUPERSEDED: "Marquer comme remplacé",
};

const ERRORS: Record<string, string> = {
  transition: "Ce changement de statut n'est pas autorisé.",
  supersession:
    "Remplacement invalide : choisis le numéro d'un autre ADR existant, non rejeté et pas déjà utilisé comme remplaçant.",
  forbidden: "Action non autorisée.",
  invalid: "Données invalides.",
  locked: "Cet ADR n'est plus modifiable.",
};

function Section({ title, text }: { title: string; text: string }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="whitespace-pre-wrap">{text}</p>
    </section>
  );
}

export default async function AdrDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; number: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, number: rawNumber } = await params;
  const { error } = await searchParams;
  const number = parseAdrNumber(rawNumber);
  if (!number) notFound();

  const user = await requireUser();

  let adr;
  try {
    adr = await getAdr(user.id, id, number);
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof AdrNotFoundError)
      notFound();
    throw e;
  }

  const transitions = allowedTransitions(adr.status);

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Link href={`/projects/${id}/adr`} className="text-sm underline">
        ← Les ADR
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">
          ADR-{formatAdrNumber(adr.number)} : {adr.title}
        </h1>
        <div className="flex items-center gap-3 text-sm">
          <AdrStatusBadge status={adr.status} />
          <span>
            Par {adr.author.name} · {adr.createdAt.toLocaleDateString("fr-FR")}
          </span>
        </div>
        {adr.supersededBy && (
          <p className="text-sm">
            Remplacé par{" "}
            <Link
              href={`/projects/${id}/adr/${adr.supersededBy.number}`}
              className="underline"
            >
              ADR-{formatAdrNumber(adr.supersededBy.number)} :{" "}
              {adr.supersededBy.title}
            </Link>
          </p>
        )}
        {adr.supersedes && (
          <p className="text-sm">
            Remplace{" "}
            <Link
              href={`/projects/${id}/adr/${adr.supersedes.number}`}
              className="underline"
            >
              ADR-{formatAdrNumber(adr.supersedes.number)} :{" "}
              {adr.supersedes.title}
            </Link>
          </p>
        )}
      </header>

      {error && ERRORS[error] && (
        <p
          className="rounded-md border border-red-300 p-3 text-sm text-red-600"
          role="alert"
        >
          {ERRORS[error]}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3">
        {transitions
          .filter((s) => s !== "SUPERSEDED")
          .map((s) => (
            <form
              key={s}
              action={changeStatusAction.bind(null, id, adr.number)}
            >
              <input type="hidden" name="newStatus" value={s} />
              <Button type="submit" variant="outline" size="sm">
                {ACTION_LABELS[s]}
              </Button>
            </form>
          ))}

        {transitions.includes("SUPERSEDED") && (
          <form
            action={changeStatusAction.bind(null, id, adr.number)}
            className="flex items-end gap-2"
          >
            <input type="hidden" name="newStatus" value="SUPERSEDED" />
            <div>
              <label htmlFor="replacement" className="text-xs">
                Remplacé par l'ADR n°
              </label>
              <Input
                id="replacement"
                name="replacement"
                type="number"
                min={1}
                required
                className="h-8 w-24"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">
              {ACTION_LABELS.SUPERSEDED}
            </Button>
          </form>
        )}

        {isContentEditable(adr.status) && (
          <Link
            href={`/projects/${id}/adr/${adr.number}/edit`}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Modifier
          </Link>
        )}
      </div>

      <Section title="Contexte" text={adr.context} />
      <Section title="Décision" text={adr.decision} />
      <Section title="Conséquences" text={adr.consequences} />
      {adr.alternatives && (
        <Section title="Alternatives" text={adr.alternatives} />
      )}
      {adr.mermaidCode && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Schéma (code Mermaid)</h2>
          <pre className="overflow-x-auto rounded-md border p-3 text-sm">
            {adr.mermaidCode}
          </pre>
        </section>
      )}
    </main>
  );
}
