import { describe, expect, it } from "vitest";
import { safeCallbackPath } from "./safe-redirect";

describe("safeCallbackPath", () => {
  it("accepte un chemin interne", () => {
    expect(safeCallbackPath("/invite/abc123")).toBe("/invite/abc123");
    expect(safeCallbackPath("/projects/x/adr?status=ACCEPTED")).toBe(
      "/projects/x/adr?status=ACCEPTED",
    );
  });

  it("réduit une URL absolue à son chemin (adresse d'origine ignorée)", () => {
    expect(safeCallbackPath("http://localhost:3000/projects/x")).toBe(
      "/projects/x",
    );
    expect(safeCallbackPath("https://evil.example/projects")).toBe("/projects");
  });

  it("refuse les redirections vers un autre site", () => {
    expect(safeCallbackPath("//evil.example")).toBe("/projects");
    expect(safeCallbackPath("/\\evil.example")).toBe("/projects");
    expect(safeCallbackPath("javascript:alert(1)")).toBe("/projects");
  });

  it("renvoie la valeur de repli si la valeur est absente ou invalide", () => {
    expect(safeCallbackPath(null)).toBe("/projects");
    expect(safeCallbackPath(undefined)).toBe("/projects");
    expect(safeCallbackPath(["/a", "/b"])).toBe("/projects");
    expect(safeCallbackPath("a".repeat(600))).toBe("/projects");
  });

  it("ne renvoie jamais vers les pages de connexion (boucle)", () => {
    expect(safeCallbackPath("/login")).toBe("/projects");
    expect(safeCallbackPath("/register?x=1")).toBe("/projects");
  });
});
