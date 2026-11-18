import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { roleLabel } from "@/lib/labels";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { getProjectForUser } from "@/services/project.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteProjectAction } from "./actions";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [user, t] = await Promise.all([requireUser(), getT()]);

  let data;
  try {
    data = await getProjectForUser(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  const isAdmin = data.role === "ADMIN";
  const errorMessage =
    error === "confirm"
      ? t("projects.errorConfirm")
      : error === "forbidden"
        ? t("projects.errorForbidden")
        : null;

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      <Link href="/projects" className="text-sm underline">
        {t("projects.backTo")}
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{data.project.name}</h1>
        {data.project.description && <p>{data.project.description}</p>}
        <p className="text-sm">
          {t("projects.yourRole", { role: roleLabel(t, data.role) })}
        </p>
      </div>

      {errorMessage && (
        <p
          className="rounded-md border border-red-300 p-3 text-sm text-red-600 dark:border-red-800 dark:text-red-400"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {isAdmin && (
        <section className="space-y-3 rounded-lg border border-red-300 p-4 dark:border-red-800">
          <h2 className="font-semibold text-red-600 dark:text-red-400">
            {t("projects.dangerTitle")}
          </h2>
          <p className="text-sm">{t("projects.dangerText")}</p>
          <form
            action={deleteProjectAction.bind(null, id)}
            className="space-y-3"
          >
            <div className="space-y-2">
              <Label htmlFor="confirmName">
                {t("projects.confirmBefore")}{" "}
                <strong>{data.project.name}</strong>{" "}
                {t("projects.confirmAfter")}
              </Label>
              <Input
                id="confirmName"
                name="confirmName"
                autoComplete="off"
                required
              />
            </div>
            <Button type="submit" variant="destructive" data-haptic="error">
              {t("projects.deleteForever")}
            </Button>
          </form>
        </section>
      )}
    </main>
  );
}
