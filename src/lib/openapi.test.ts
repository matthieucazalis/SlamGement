import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { openApiSpec } from "./openapi";

describe("description OpenAPI", () => {
  it("est une description OpenAPI 3 avec une sécurité déclarée", () => {
    expect(openApiSpec.openapi).toMatch(/^3\./);
    expect(openApiSpec.security).toEqual([
      { bearerAuth: [] },
      { sessionCookie: [] },
    ]);
  });

  it("référence uniquement des schémas qui existent", () => {
    const text = JSON.stringify(openApiSpec);
    const refs = [...text.matchAll(/#\/components\/schemas\/(\w+)/g)].map(
      (m) => m[1],
    );
    for (const name of refs)
      expect(Object.keys(openApiSpec.components.schemas)).toContain(name);
  });

  it("chaque chemin décrit correspond à un fichier route.ts", () => {
    const base = join(__dirname, "../app/api/v1");
    for (const path of Object.keys(openApiSpec.paths)) {
      const segments = path
        .split("/")
        .filter(Boolean)
        .map((s) => (s.startsWith("{") ? `[${s.slice(1, -1)}]` : s));
      const file = join(base, ...segments, "route.ts");
      expect(existsSync(file), `route manquante pour ${path}`).toBe(true);
      // chaque méthode décrite est bien exportée par le fichier
      const source = readFileSync(file, "utf-8");
      for (const method of Object.keys(
        openApiSpec.paths[path as keyof typeof openApiSpec.paths],
      ))
        expect(source, `${method.toUpperCase()} manquant dans ${path}`).toMatch(
          new RegExp(
            `export (const|async function|function) ${method.toUpperCase()}\\b`,
          ),
        );
    }
  });
});
