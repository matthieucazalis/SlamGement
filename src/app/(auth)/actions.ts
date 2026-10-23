"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { normalizeIp } from "@/lib/rate-limit";
import { loginSchema, registerSchema } from "@/lib/validators/auth";
import { isLoginBlocked } from "@/services/rate-limit.service";
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

  const ip = normalizeIp((await headers()).get("x-forwarded-for"));
  if (await isLoginBlocked(parsed.data.email, ip))
    return { error: "Trop de tentatives. Réessaie dans 15 minutes." };

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/projects" });
  } catch (e) {
    if (e instanceof AuthError) return { error: "Identifiants invalides." };
    throw e; // une connexion réussie passe par une redirection : ne pas l'avaler
  }
}
