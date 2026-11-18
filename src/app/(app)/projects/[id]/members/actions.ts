"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getT } from "@/i18n/server";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { firstIssueMessage } from "@/lib/validators/messages";
import { inviteSchema, roleSchema } from "@/lib/validators/member";
import {
  AlreadyMemberError,
  createInvitation,
} from "@/services/invitation.service";
import {
  LastAdminError,
  MemberNotFoundError,
  changeMemberRole,
  removeMember,
} from "@/services/member.service";

export type InviteState = { error?: string; invitePath?: string } | undefined;

export async function inviteAction(
  projectId: string,
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const [user, t] = await Promise.all([requireUser(), getT()]);
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssueMessage(t, parsed.error) };

  try {
    const token = await createInvitation(
      user.id,
      projectId,
      parsed.data.email,
      parsed.data.role,
    );
    return { invitePath: `/invite/${token}` };
  } catch (e) {
    if (e instanceof ForbiddenError) return { error: t("errors.adminOnly") };
    if (e instanceof AlreadyMemberError)
      return { error: t("errors.alreadyMember") };
    throw e;
  }
}

export async function changeRoleAction(
  projectId: string,
  membershipId: string,
  formData: FormData,
) {
  const user = await requireUser();
  const role = roleSchema.safeParse(formData.get("role"));
  if (!role.success) redirect(`/projects/${projectId}/members?error=invalid`);

  try {
    await changeMemberRole(user.id, projectId, membershipId, role.data);
  } catch (e) {
    if (e instanceof LastAdminError)
      redirect(`/projects/${projectId}/members?error=last-admin`);
    if (e instanceof ForbiddenError || e instanceof MemberNotFoundError)
      redirect(`/projects/${projectId}/members?error=forbidden`);
    throw e;
  }
  revalidatePath(`/projects/${projectId}/members`);
}

export async function removeMemberAction(
  projectId: string,
  membershipId: string,
) {
  const user = await requireUser();

  let left = false;
  try {
    ({ left } = await removeMember(user.id, projectId, membershipId));
  } catch (e) {
    if (e instanceof LastAdminError)
      redirect(`/projects/${projectId}/members?error=last-admin`);
    if (e instanceof ForbiddenError || e instanceof MemberNotFoundError)
      redirect(`/projects/${projectId}/members?error=forbidden`);
    throw e;
  }

  if (left) redirect("/projects");
  revalidatePath(`/projects/${projectId}/members`);
}
