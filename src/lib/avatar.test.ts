import { describe, expect, it } from "vitest";
import { AVATAR_MAX_CHARS, checkAvatarDataUrl } from "./avatar";

const b64 = (bytes: number[]) => Buffer.from(bytes).toString("base64");
const JPEG = `data:image/jpeg;base64,${b64([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1])}`;
const PNG = `data:image/png;base64,${b64([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])}`;
const WEBP = `data:image/webp;base64,${Buffer.from("RIFF\0\0\0\0WEBPVP8 ", "binary").toString("base64")}`;

describe("checkAvatarDataUrl", () => {
  it("accepte un JPEG, un PNG et un WebP valides", () => {
    expect(checkAvatarDataUrl(JPEG).ok).toBe(true);
    expect(checkAvatarDataUrl(PNG).ok).toBe(true);
    expect(checkAvatarDataUrl(WEBP).ok).toBe(true);
  });

  it("refuse ce qui n'est pas du texte", () => {
    expect(checkAvatarDataUrl(null)).toEqual({ ok: false, reason: "invalid" });
    expect(checkAvatarDataUrl(42)).toEqual({ ok: false, reason: "invalid" });
  });

  it("refuse un type MIME non autorisé (SVG, HTML…)", () => {
    const svg = `data:image/svg+xml;base64,${Buffer.from("<svg onload=alert(1)/>").toString("base64")}`;
    const html = `data:text/html;base64,${Buffer.from("<script>1</script>").toString("base64")}`;
    expect(checkAvatarDataUrl(svg).ok).toBe(false);
    expect(checkAvatarDataUrl(html).ok).toBe(false);
  });

  it("refuse une adresse qui n'est pas une data URL", () => {
    expect(checkAvatarDataUrl("https://evil.example/a.png").ok).toBe(false);
    expect(checkAvatarDataUrl("javascript:alert(1)").ok).toBe(false);
  });

  it("refuse un fichier dont la signature ne correspond pas au type annoncé", () => {
    const fake = `data:image/png;base64,${Buffer.from("<script>alert(1)</script>").toString("base64")}`;
    expect(checkAvatarDataUrl(fake)).toEqual({ ok: false, reason: "invalid" });
    // un PNG annoncé comme JPEG
    expect(checkAvatarDataUrl(PNG.replace("image/png", "image/jpeg")).ok).toBe(
      false,
    );
  });

  it("refuse une image trop volumineuse", () => {
    const big = `data:image/jpeg;base64,${"A".repeat(AVATAR_MAX_CHARS)}`;
    expect(checkAvatarDataUrl(big)).toEqual({ ok: false, reason: "tooBig" });
  });

  it("refuse du base64 mal formé", () => {
    expect(checkAvatarDataUrl("data:image/jpeg;base64,@@@").ok).toBe(false);
    expect(checkAvatarDataUrl("data:image/jpeg;base64,").ok).toBe(false);
  });
});
