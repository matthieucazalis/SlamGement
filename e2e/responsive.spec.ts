import { expect, test, type Page } from "@playwright/test";
import { createAdr, createProject, signUpAndLogin } from "./helpers";

test.use({ viewport: { width: 375, height: 812 } });

async function expectNoHorizontalScroll(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main").first()).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, `${path} déborde de ${overflow}px`).toBeLessThanOrEqual(0);
}

test.describe("responsive (375 px)", () => {
  test("les pages publiques ne défilent pas horizontalement", async ({
    page,
  }) => {
    await expectNoHorizontalScroll(page, "/login");
    await expectNoHorizontalScroll(page, "/register");
  });

  test("toutes les pages d'un projet tiennent dans l'écran", async ({
    page,
  }) => {
    await signUpAndLogin(page);
    await expectNoHorizontalScroll(page, "/projects");

    const projectPath = await createProject(page, "Projet mobile e2e");
    await createAdr(page, projectPath, {
      title: "Architecture générale de l'application",
      mermaid:
        "graph LR; A[Application cliente très longue] --> B[Passerelle API] --> C[Service métier] --> D[(Base de données)] --> E[Sauvegarde]",
    });

    await page.goto(`${projectPath}/kanban`);
    await page.getByText("Nouvelle tâche", { exact: true }).click();
    await page
      .getByLabel("Titre", { exact: true })
      .fill(
        "Une tâche au titre volontairement très long pour vérifier le retour à la ligne",
      );
    await page.getByRole("button", { name: "Ajouter la tâche" }).click();
    await expect(page.getByText("Une tâche au titre").first()).toBeVisible();

    const paths = [
      projectPath,
      `${projectPath}/dashboard`,
      `${projectPath}/adr`,
      `${projectPath}/adr/new`,
      `${projectPath}/kanban`,
      `${projectPath}/members`,
      `${projectPath}/history`,
    ];
    for (const path of paths) {
      await expectNoHorizontalScroll(page, path);
    }

    await page.goto(`${projectPath}/adr/1`);
    await expect(page.locator('main svg[id^="mermaid-"]')).toBeVisible({
      timeout: 20_000,
    });
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, "ADR avec schéma").toBeLessThanOrEqual(0);
  });

  test("la navigation du projet est utilisable au téléphone", async ({
    page,
  }) => {
    await signUpAndLogin(page);
    const projectPath = await createProject(page, "Projet navigation e2e");

    const nav = page.getByRole("navigation", { name: "Navigation du projet" });
    const kanban = nav.getByRole("link", { name: "Kanban" });
    await kanban.scrollIntoViewIfNeeded();
    await kanban.click();
    await expect(page).toHaveURL(new RegExp(`${projectPath}/kanban$`));
    await expect(nav.getByRole("link", { name: "Kanban" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
