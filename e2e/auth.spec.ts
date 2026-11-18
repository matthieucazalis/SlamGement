import { expect, test } from "@playwright/test";
import {
  PASSWORD,
  login,
  register,
  signUpAndLogin,
  uniqueEmail,
} from "./helpers";

test.describe("authentification", () => {
  test("une page protégée redirige vers la connexion", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/login/);
  });

  test("inscription, connexion puis déconnexion", async ({ page }) => {
    await signUpAndLogin(page, "Alice");
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/login/);

    // la session est bien terminée
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/login/);
  });

  test("un mauvais mot de passe est refusé avec un message neutre", async ({
    page,
  }) => {
    const email = uniqueEmail();
    await register(page, "Bob", email);
    await login(page, email, "mauvais-mot-de-passe");
    await expect(page.getByText("Identifiants invalides.")).toBeVisible();
  });

  test("un email inconnu reçoit le même message", async ({ page }) => {
    await login(page, uniqueEmail("inconnu"));
    await expect(page.getByText("Identifiants invalides.")).toBeVisible();
  });

  test("un email déjà utilisé est refusé à l'inscription", async ({ page }) => {
    const email = uniqueEmail();
    await register(page, "Claire", email);

    await page.goto("/register");
    await page.getByLabel("Nom", { exact: true }).fill("Claire bis");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText("Cet email est déjà utilisé.")).toBeVisible();
  });

  test("après 5 échecs, la connexion est bloquée même avec le bon mot de passe", async ({
    page,
  }) => {
    const email = uniqueEmail();
    await register(page, "David", email);

    for (let i = 0; i < 5; i++) {
      await login(page, email, "mauvais-mot-de-passe");
      await expect(page.getByText("Identifiants invalides.")).toBeVisible();
    }

    await login(page, email, PASSWORD);
    await expect(page.getByText(/Trop de tentatives/)).toBeVisible();
  });
});
