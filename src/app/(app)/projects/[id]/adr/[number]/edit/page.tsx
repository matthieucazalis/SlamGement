import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatAdrNumber, parseAdrNumber } from "@/lib/adr-format";
import { isContentEditable } from "@/lib/adr-status";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { AdrNotFoundError, getAdr } from "@/services/adr.service";
import { updateAdrAction } from "../../actions";
import { AdrForm } from "../../adr-form";

export default async function EditAdrPage({
  params,
}: {
  params: Promise<{ id: string; number: string }>;
}) {
  const { id, number: rawNumber } = await params;
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

  if (!isContentEditable(adr.status))
    redirect(`/projects/${id}/adr/${number}?error=locked`);

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Link
        href={`/projects/${id}/adr/${number}`}
        className="text-sm underline"
      >
        ← ADR-{formatAdrNumber(number)}
      </Link>
      <h1 className="text-2xl font-bold">Modifier l'ADR</h1>
      <AdrForm
        action={updateAdrAction.bind(null, id, number)}
        initial={{
          title: adr.title,
          context: adr.context,
          decision: adr.decision,
          consequences: adr.consequences,
          alternatives: adr.alternatives ?? "",
          mermaidCode: adr.mermaidCode ?? "",
        }}
        submitLabel="Enregistrer"
      />
    </main>
  );
}
