"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { checkAvatarDataUrl } from "@/lib/avatar";
import { requireUser } from "@/lib/session";
import { passwordSchema, profileSchema } from "@/lib/validators/auth";
import { firstIssueMessage } from "@/lib/validators/messages";
import {
  LastAdminBlockedError,
  deleteAccount,
  setAvatar,
} from "@/services/account.service";
import {
  WrongPasswordError,
  changePassword,
  updateProfile,
} from "@/services/user.service";

export type ProfileState = { error?: string; success?: string } | undefined;

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const [user, t] = await Promise.all([requireUser(), getT()]);
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssueMessage(t, parsed.error) };

  await updateProfile(user.id, parsed.data.name);
  revalidatePath("/", "layout");
  return { success: t("profile.updated") };
}

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const [user, t] = await Promise.all([requireUser(), getT()]);
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssueMessage(t, parsed.error) };

  try {
    await changePassword(
      user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
  } catch (e) {
    if (e instanceof WrongPasswordError)
      return { error: t("errors.wrongPassword") };
    throw e;
  }
  return { success: t("profile.passwordChanged") };
}

export async function saveAvatarAction(
  dataUrl: string,
): Promise<NonNullable<ProfileState>> {
  const [user, t] = await Promise.all([requireUser(), getT()]);
  const check = checkAvatarDataUrl(dataUrl);
  if (!check.ok)
    return {
      error:
        check.reason === "tooBig"
          ? t("profile.avatarTooBig")
          : t("profile.avatarInvalid"),
    };

  await setAvatar(user.id, check.dataUrl);
  revalidatePath("/", "layout");
  return { success: t("profile.avatarSaved") };
}

export async function removeAvatarAction(): Promise<NonNullable<ProfileState>> {
  const [user, t] = await Promise.all([requireUser(), getT()]);
  await setAvatar(user.id, null);
  revalidatePath("/", "layout");
  return { success: t("profile.avatarRemoved") };
}

export async function deleteAccountAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const [user, t] = await Promise.all([requireUser(), getT()]);
  const password = String(formData.get("password") ?? "");

  try {
    await deleteAccount(user.id, password);
  } catch (e) {
    if (e instanceof WrongPasswordError)
      return { error: t("errors.wrongPassword") };
    if (e instanceof LastAdminBlockedError)
      return { error: t("profile.deleteBlocked", { project: e.projectName }) };
    throw e;
  }

  await signOut({ redirectTo: "/login?deleted=1" });
}
