import { expect, request, test } from "@playwright/test";
import { createProject, signUpAndLogin } from "./helpers";

test.describe("API REST v1", () => {
  test("refuse les requêtes sans session (401 JSON)", async ({ baseURL }) => {
    const anonymous = await request.newContext({ baseURL });
    const res = await anonymous.get("/api/v1/projects");
    expect(res.status()).toBe(401);
    expect((await res.json()).error.code).toBe("unauthenticated");
    await anonymous.dispose();
  });

  test("liste les projets et les ADR d'un membre, rien de plus", async ({
    page,
  }) => {
    await signUpAndLogin(page);
    const projectPath = await createProject(page, "Projet API e2e");
    const projectId = projectPath.split("/").pop();

    const projects = await page.request.get("/api/v1/projects");
    expect(projects.status()).toBe(200);
    const body = await projects.json();
    expect(body.data.map((p: { name: string }) => p.name)).toContain(
      "Projet API e2e",
    );

    const adrs = await page.request.get(`/api/v1/projects/${projectId}/adrs`);
    expect(adrs.status()).toBe(200);
    expect((await adrs.json()).data).toEqual([]);

    // projet d'un autre : 404, pas 403 (on ne révèle pas son existence)
    const other = await page.request.get("/api/v1/projects/inexistant/adrs");
    expect(other.status()).toBe(404);

    const spec = await page.request.get("/api/v1/openapi.json");
    expect((await spec.json()).openapi).toMatch(/^3\./);
  });
});
