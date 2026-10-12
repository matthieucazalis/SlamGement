"use server";

import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { inviteSchema } from "@/lib/validators/member";
import {
  AlreadyMemberError,
  createInvitation,
} from "@/services/invitation.service";

export type InviteState = { error?: string; invitePath?: string } | undefined;

export async function inviteAction(
  projectId: string,
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const user = await requireUser();
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const token = await createInvitation(
      user.id,
      projectId,
      parsed.data.email,
      parsed.data.role,
    );
    return { invitePath: `/invite/${token}` };
  } catch (e) {
    if (e instanceof ForbiddenError)
      return { error: "Action réservée aux administrateurs." };
    if (e instanceof AlreadyMemberError)
      return { error: "Cette personne est déjà membre du projet." };
    throw e;
  }
}
