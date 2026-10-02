"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validators/auth";
import { EmailTakenError, registerUser } from "@/services/user.service";

export type FormState = { error?: string } | undefined;

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await registerUser(parsed.data);
  } catch (e) {
    if (e instanceof EmailTakenError)
      return { error: "Cet email est déjà utilisé." };
    throw e;
  }
  redirect("/login?registered=1");
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Identifiants invalides." };

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/projects" });
  } catch (e) {
    if (e instanceof AuthError) return { error: "Identifiants invalides." };
    throw e;
  }
}
