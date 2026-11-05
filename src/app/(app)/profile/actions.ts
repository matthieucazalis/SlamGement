"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { passwordSchema, profileSchema } from "@/lib/validators/auth";
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
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await updateProfile(user.id, parsed.data.name);
  revalidatePath("/profile");
  return { success: "Profil mis à jour." };
}

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await changePassword(
      user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
  } catch (e) {
    if (e instanceof WrongPasswordError)
      return { error: "Mot de passe actuel incorrect." };
    throw e;
  }
  return { success: "Mot de passe modifié." };
}
