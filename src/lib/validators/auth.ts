import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "validation.min2").max(60),
  email: z.string().trim().toLowerCase().email("validation.email"),
  password: z.string().min(8, "validation.min8").max(72, "validation.max72"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "validation.min2").max(60),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "validation.currentPasswordRequired"),
    newPassword: z
      .string()
      .min(8, "validation.min8")
      .max(72, "validation.max72"),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "validation.passwordMismatch",
    path: ["confirm"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("validation.email"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "validation.min8").max(72, "validation.max72"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "validation.passwordMismatch",
    path: ["confirm"],
  });
