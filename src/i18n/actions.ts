"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  HAPTICS_COOKIE,
  LOCALES,
  LOCALE_COOKIE,
  PREFERENCE_MAX_AGE,
  THEMES,
  THEME_COOKIE,
} from "./config";

const schema = z.object({
  locale: z.enum(LOCALES).optional(),
  theme: z.enum(THEMES).optional(),
  haptics: z.boolean().optional(),
});

export type PreferencesInput = z.infer<typeof schema>;

// Enregistre les préférences dans des cookies (effet immédiat, même sans
// compte) et, si l'utilisateur est connecté, sur son compte (multi-appareils).
export async function updatePreferencesAction(
  input: PreferencesInput,
): Promise<{ ok: boolean }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const { locale, theme, haptics } = parsed.data;

  const jar = await cookies();
  const options = {
    path: "/",
    maxAge: PREFERENCE_MAX_AGE,
    sameSite: "lax" as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  if (locale) jar.set(LOCALE_COOKIE, locale, options);
  if (theme) jar.set(THEME_COOKIE, theme, options);
  if (haptics !== undefined)
    jar.set(HAPTICS_COOKIE, haptics ? "1" : "0", options);

  const session = await auth();
  if (session?.user?.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(locale ? { locale } : {}),
        ...(theme ? { theme } : {}),
        ...(haptics !== undefined ? { haptics } : {}),
      },
    });
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
