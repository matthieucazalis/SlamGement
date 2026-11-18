import Link from "next/link";
import { notFound } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import { getT } from "@/i18n/server";
import { displayName, roleLabel } from "@/lib/labels";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { listMembers } from "@/services/member.service";
import { getProjectForUser } from "@/services/project.service";
import { Button } from "@/components/ui/button";
import { changeRoleAction, removeMemberAction } from "./actions";
import { InviteForm } from "./invite-form";

export default async function MembersPage({
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
  let members;
  try {
    data = await getProjectForUser(user.id, id);
    members = await listMembers(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  const isAdmin = data.role === "ADMIN";
  const errorMessage =
    error === "last-admin"
      ? t("members.errorLastAdmin")
      : error === "forbidden"
        ? t("members.errorForbidden")
        : error === "invalid"
          ? t("members.errorInvalid")
          : null;

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      <Link href={`/projects/${id}`} className="text-sm underline">
        ← {data.project.name}
      </Link>
      <h1 className="text-2xl font-bold">{t("members.title")}</h1>

      {errorMessage && (
        <p
          className="rounded-md border border-red-300 p-3 text-sm text-red-600 dark:border-red-800 dark:text-red-400"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <ul className="divide-y rounded-lg border">
        {members.map((m) => {
          const isSelf = m.userId === user.id;
          const name = displayName(t, m.user.name);
          return (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3"
            >
              <div className="flex items-center gap-3">
                <UserAvatar name={name} src={m.user.avatar} size={36} />
                <div>
                  <p className="font-medium">
                    {name}{" "}
                    {isSelf && (
                      <span className="text-xs">{t("members.you")}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <form
                    action={changeRoleAction.bind(null, id, m.id)}
                    className="flex items-center gap-2"
                  >
                    <select
                      name="role"
                      defaultValue={m.role}
                      aria-label={t("members.roleOf", { name })}
                      className="h-8 rounded-md border bg-transparent px-2 text-sm"
                    >
                      <option value="MEMBER">{roleLabel(t, "MEMBER")}</option>
                      <option value="ADMIN">{roleLabel(t, "ADMIN")}</option>
                    </select>
                    <Button type="submit" variant="outline" size="sm">
                      {t("members.apply")}
                    </Button>
                  </form>
                ) : (
                  <span className="text-xs">{roleLabel(t, m.role)}</span>
                )}

                {(isAdmin || isSelf) && (
                  <form action={removeMemberAction.bind(null, id, m.id)}>
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      data-haptic="error"
                    >
                      {isSelf ? t("members.leave") : t("members.remove")}
                    </Button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {isAdmin && <InviteForm projectId={id} />}
    </main>
  );
}
