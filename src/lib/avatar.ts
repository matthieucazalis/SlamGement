// Photo de profil : une petite image (256 px, JPEG) envoyée par le navigateur
// sous forme de data URL. Le serveur ne fait pas confiance à ce que le client
// annonce : il revérifie le format, la taille et la signature du fichier.
export const AVATAR_MAX_CHARS = 150_000; // ≈ 110 Ko d'image

const PATTERN =
  /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) =>
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  // WebP : « RIFF » puis 4 octets de taille, puis « WEBP »
  "image/webp": (b) =>
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP",
};

export type AvatarCheck =
  { ok: true; dataUrl: string } | { ok: false; reason: "invalid" | "tooBig" };

export function checkAvatarDataUrl(value: unknown): AvatarCheck {
  if (typeof value !== "string") return { ok: false, reason: "invalid" };
  if (value.length > AVATAR_MAX_CHARS) return { ok: false, reason: "tooBig" };

  const match = PATTERN.exec(value);
  if (!match) return { ok: false, reason: "invalid" };

  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length < 12 || !SIGNATURES[match[1]](bytes))
    return { ok: false, reason: "invalid" };

  return { ok: true, dataUrl: value };
}
