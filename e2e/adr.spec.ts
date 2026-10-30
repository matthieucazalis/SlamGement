import { expect, test } from "@playwright/test";
import { createAdr, createProject, signUpAndLogin } from "./helpers";

test.describe("ADR", () => {
  test("cycle de vie : création, numérotation, acceptation, verrouillage", async ({
    page,
  }) => {
    await signUpAndLogin(page);
    const projectPath = await createProject(page, "Projet ADR e2e");

    const first = await createAdr(page, projectPath, {
      title: "Choix de la base de données",
    });
    expect(first).toBe(1);
    await expect(page.getByRole("heading", { name: /ADR-0001/ })).toBeVisible();
    await expect(page.getByText("Proposé", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Modifier" })).toBeVisible();

    const second = await createAdr(page, projectPath, {
      title: "Hébergement",
    });
    expect(second).toBe(2);

    await page.goto(`${projectPath}/adr/1`);
    await page.getByRole("button", { name: "Accepter" }).click();
    await expect(page.getByText("Accepté", { exact: true })).toBeVisible();

    await expect(page.getByRole("link", { name: "Modifier" })).toHaveCount(0);

    await page.goto(`${projectPath}/adr/1/edit`);
    await expect(page.getByText("n'est plus modifiable")).toBeVisible();
  });

  test("le contenu malveillant n'est ni exécuté ni affiché en HTML", async ({
    page,
  }) => {
    const dialogs: string[] = [];
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    await signUpAndLogin(page);
    const projectPath = await createProject(page, "Projet XSS e2e");

    await createAdr(page, projectPath, {
      title: "Test de sécurité du rendu",
      context: [
        '<script>alert("xss-script")</script>',
        '<img src=x onerror=alert("xss-img")>',
        '[clic](javascript:alert("xss-link"))',
        "![pixel](https://exemple.com/pixel.png)",
      ].join("\n\n"),
    });

    await expect(page.locator("main script")).toHaveCount(0);
    await expect(page.locator("main img")).toHaveCount(0);

    const links = page.locator("main a", { hasText: "clic" });
    for (let i = 0; i < (await links.count()); i++) {
      const href = (await links.nth(i).getAttribute("href")) ?? "";
      expect(href).not.toMatch(/^javascript:/i);
    }

    await page.waitForTimeout(500);
    expect(dialogs).toEqual([]);
  });

  test("le schéma Mermaid s'affiche sans violation de la CSP", async ({
    page,
  }) => {
    const cspViolations: string[] = [];
    page.on("console", (msg) => {
      if (/content security policy/i.test(msg.text()))
        cspViolations.push(msg.text());
    });

    await signUpAndLogin(page);
    const projectPath = await createProject(page, "Projet Mermaid e2e");

    await createAdr(page, projectPath, {
      title: "Architecture générale",
      mermaid: "graph TD; A[Client] --> B[API]; B --> C[(Base)]",
    });

    await expect(page.locator('main svg[id^="mermaid-"]')).toBeVisible({
      timeout: 20_000,
    });
    expect(cspViolations).toEqual([]);
  });
});
