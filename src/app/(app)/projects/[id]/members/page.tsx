import Link from "next/link";
import { notFound } from "next/navigation";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { listMembers } from "@/services/member.service";
import { getProjectForUser } from "@/services/project.service";
import { InviteForm } from "./invite-form";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  let data;
  let members;
  try {
    data = await getProjectForUser(user.id, id);
    members = await listMembers(user.id, id);
  } catch (e) {
    if (e instanceof ForbiddenError) notFound();
    throw e;
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Link href={`/projects/${id}`} className="text-sm underline">
        ← {data.project.name}
      </Link>
      <h1 className="text-2xl font-bold">Membres</h1>

      <ul className="divide-y rounded-lg border">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between p-3">
            <div>
              <p className="font-medium">{m.user.name}</p>
              <p className="text-sm text-muted-foreground">{m.user.email}</p>
            </div>
            <span className="text-xs uppercase">{m.role}</span>
          </li>
        ))}
      </ul>

      {data.role === "ADMIN" && <InviteForm projectId={id} />}
    </main>
  );
}
