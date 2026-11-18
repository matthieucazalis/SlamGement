import { expect, test } from "@playwright/test";
import { PASSWORD, login, signUpAndLogin } from "./helpers";

// PNG 1×1 valide
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test.describe("profil", () => {
  test("une photo choisie dans la galerie est enregistrée puis supprimable", async ({
    page,
  }) => {
    await signUpAndLogin(page);
    await page.goto("/profile");

    await page.getByTestId("avatar-gallery").setInputFiles({
      name: "photo.png",
      mimeType: "image/png",
      buffer: PNG,
    });
    await expect(page.getByText("Photo mise à jour.")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Photo de profil" }),
    ).toBeVisible();

    // la photo est aussi affichée dans la barre du haut après rechargement
    await page.reload();
    await expect(
      page.getByRole("img", { name: "Photo de profil" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Supprimer la photo" }).click();
    await expect(page.getByText("Photo supprimée.")).toBeVisible();
  });

  test("un fichier qui n'est pas une image est refusé sans planter", async ({
    page,
  }) => {
    await signUpAndLogin(page);
    await page.goto("/profile");
    await page.getByTestId("avatar-gallery").setInputFiles({
      name: "faux.png",
      mimeType: "image/png",
      buffer: Buffer.from("ceci n'est pas une image"),
    });
    await expect(
      page.getByRole("alert").filter({ hasText: /image/i }),
    ).toBeVisible();
  });

  test("l'export RGPD télécharge un fichier JSON", async ({ page }) => {
    await signUpAndLogin(page);
    await page.goto("/profile");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: /Télécharger mes données/ }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^slamgement-data-.*\.json$/);
  });

  test("la suppression du compte exige le mot de passe, puis empêche toute connexion", async ({
    page,
  }) => {
    const email = await signUpAndLogin(page);
    await page.goto("/profile");

    await page
      .getByLabel("Mot de passe pour confirmer")
      .fill("mauvais-mot-de-passe");
    await page
      .getByRole("button", { name: "Supprimer définitivement mon compte" })
      .click();
    await expect(
      page.getByText("Mot de passe actuel incorrect."),
    ).toBeVisible();

    await page.getByLabel("Mot de passe pour confirmer").fill(PASSWORD);
    await page
      .getByRole("button", { name: "Supprimer définitivement mon compte" })
      .click();
    await expect(page).toHaveURL(/\/login\?deleted=1/);
    await expect(page.getByText(/Ton compte a été supprimé/)).toBeVisible();

    await login(page, email);
    await expect(page.getByText("Identifiants invalides.")).toBeVisible();
  });
});

test.describe("mot de passe oublié", () => {
  test("la réponse est la même que le compte existe ou non", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page
      .getByLabel("Email")
      .fill("personne-ne-connait-cette-adresse@e2e.test");
    await page.getByRole("button", { name: "Envoyer le lien" }).click();
    await expect(page.getByText(/Si un compte existe/)).toBeVisible();
  });

  test("un lien invalide est signalé", async ({ page }) => {
    await page.goto(`/reset-password/${"a".repeat(64)}`);
    await expect(
      page.getByText(/invalide, expiré ou déjà utilisé/),
    ).toBeVisible();
  });
});
