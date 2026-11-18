import { apiError, apiJson, badBody, readJson, withUser } from "@/lib/api";
import { AVATAR_MAX_CHARS, checkAvatarDataUrl } from "@/lib/avatar";
import { setAvatar } from "@/services/account.service";

// Photo de profil envoyée par l'application (image 256 px en data URL).
// Même validation stricte que sur le site : format, signature binaire, taille.
export const PUT = withUser(async ({ userId, request }) => {
  const raw = await readJson(request, AVATAR_MAX_CHARS + 200);
  if (!raw.ok) return badBody(raw.reason);

  const dataUrl = (raw.data as { dataUrl?: unknown } | null)?.dataUrl;
  const check = checkAvatarDataUrl(dataUrl);
  if (!check.ok)
    return apiError(
      422,
      check.reason === "tooBig" ? "image_too_large" : "invalid_image",
      "Invalid image.",
    );

  await setAvatar(userId, check.dataUrl);
  return apiJson({ avatar: check.dataUrl });
});

export const DELETE = withUser(async ({ userId }) => {
  await setAvatar(userId, null);
  return new Response(null, { status: 204 });
});
