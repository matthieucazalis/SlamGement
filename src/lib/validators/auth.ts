import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "2 caractères minimum").max(60),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .max(72, "72 caractères maximum"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "2 caractères minimum").max(60),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "8 caractères minimum")
      .max(72, "72 caractères maximum"),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });
