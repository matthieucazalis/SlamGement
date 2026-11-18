import { expect, test } from "@playwright/test";
import { PASSWORD, loginAndWait, signUpAndLogin } from "./helpers";

test.describe("préférences : langue et thème", () => {
  test("la langue change toute l'interface et reste après rechargement", async ({
    page,
  }) => {
    await signUpAndLogin(page);
    await page.goto("/settings");

    await page.getByRole("radio", { name: "English" }).check();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.reload();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    await page.getByRole("radio", { name: "Deutsch" }).check();
    await expect(
      page.getByRole("heading", { name: "Einstellungen" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "de");

    // les autres pages suivent
    await page.goto("/projects");
    await expect(
      page.getByRole("heading", { name: "Meine Projekte" }),
    ).toBeVisible();
  });

  test("le mode sombre s'applique, persiste, et se désactive", async ({
    page,
  }) => {
    await signUpAndLogin(page);
    await page.goto("/settings");
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await page.getByRole("radio", { name: "Sombre" }).check();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByRole("radio", { name: "Clair" }).check();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("les préférences suivent le compte sur un autre appareil", async ({
    page,
    browser,
  }) => {
    const email = await signUpAndLogin(page);
    await page.goto("/settings");
    await page.getByRole("radio", { name: "Deutsch" }).check();
    await expect(
      page.getByRole("heading", { name: "Einstellungen" }),
    ).toBeVisible();
    await page.getByRole("radio", { name: "Dunkel" }).check();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // autre navigateur, sans cookie de préférence
    const other = await browser.newContext({ locale: "fr-FR" });
    const page2 = await other.newPage();
    await loginAndWait(page2, email, PASSWORD);
    await page2.goto("/settings");
    await expect(
      page2.getByRole("heading", { name: "Einstellungen" }),
    ).toBeVisible();
    await expect(page2.locator("html")).toHaveClass(/dark/);
    await other.close();
  });

  test("on peut changer de langue avant de se connecter", async ({ page }) => {
    await page.goto("/login");
    // l'étiquette du sélecteur change avec la langue (« Langue » → « Language ») :
    // on le cible par son identifiant
    const picker = page.locator("#quick-locale");
    await picker.selectOption("en");
    await expect(page.getByText("Sign in to SlamGement")).toBeVisible();
    await picker.selectOption("de");
    await expect(page.getByText("Anmeldung bei SlamGement")).toBeVisible();
  });
});
