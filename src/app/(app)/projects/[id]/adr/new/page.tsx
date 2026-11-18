import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { getProjectForUser } from "@/services/project.service";
import { createAdrAction } from "../actions";
import { AdrForm } from "../adr-form";

export default async function NewAdrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, t] = await Promise.all([requireUser(), getT()]);

  try {
    await getProjectForUser(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      <Link href={`/projects/${id}/adr`} className="text-sm underline">
        {t("adr.backToList")}
      </Link>
      <h1 className="text-2xl font-bold">{t("adr.newTitle")}</h1>
      <AdrForm
        action={createAdrAction.bind(null, id)}
        submitLabel={t("adr.createSubmit")}
        draftKey={`slamgement:adr-draft:${id}`}
      />
    </main>
  );
}
