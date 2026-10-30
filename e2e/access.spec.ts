import { expect, test } from "@playwright/test";
import {
  createAdr,
  createProject,
  login,
  register,
  signUpAndLogin,
  uniqueEmail,
} from "./helpers";

test.describe("contrôle d'accès", () => {
  test("un non-membre reçoit une 404 sur tout le projet", async ({
    page,
    browser,
    baseURL,
  }) => {
    await signUpAndLogin(page, "Alice");
    const projectPath = await createProject(page, "Projet privé");
    await createAdr(page, projectPath, { title: "Décision confidentielle" });

    const contextB = await browser.newContext({ baseURL: baseURL! });
    const pageB = await contextB.newPage();
    await signUpAndLogin(pageB, "Bob");

    const paths = [
      projectPath,
      `${projectPath}/adr`,
      `${projectPath}/adr/1`,
      `${projectPath}/adr/1/export`,
      `${projectPath}/adr/export`,
      `${projectPath}/kanban`,
      `${projectPath}/members`,
      `${projectPath}/dashboard`,
      `${projectPath}/history`,
    ];
    for (const path of paths) {
      const response = await pageB.goto(path);
      expect(response?.status(), path).toBe(404);
    }
    await contextB.close();
  });

  test("un visiteur non connecté est renvoyé vers la connexion", async ({
    page,
    browser,
    baseURL,
  }) => {
    await signUpAndLogin(page);
    const projectPath = await createProject(page, "Projet visiteur");

    const anonymous = await browser.newContext({ baseURL: baseURL! });
    const anonymousPage = await anonymous.newPage();
    await anonymousPage.goto(projectPath);
    await expect(anonymousPage).toHaveURL(/\/login/);
    await anonymous.close();
  });

  test("invitation : un membre invité a des droits limités, le lien est à usage unique", async ({
    page,
    browser,
    baseURL,
  }) => {
    await signUpAndLogin(page, "Alice");
    const projectPath = await createProject(page, "Projet collaboratif");

    const contextB = await browser.newContext({ baseURL: baseURL! });
    const pageB = await contextB.newPage();
    const emailB = uniqueEmail("bob");
    await register(pageB, "Bob", emailB);

    await page.goto(`${projectPath}/members`);
    await page.getByLabel("Email", { exact: true }).fill(emailB);
    await page
      .getByRole("button", { name: "Créer le lien d'invitation" })
      .click();
    const inviteLink = await page.locator("input[readonly]").inputValue();
    expect(inviteLink).toContain("/invite/");

    await login(pageB, emailB);
    await pageB.goto(inviteLink);
    await pageB.getByRole("button", { name: "Rejoindre le projet" }).click();
    await pageB.waitForURL(new RegExp(`${projectPath}$`));
    await expect(pageB.getByText("Ton rôle : MEMBER")).toBeVisible();

    await pageB.goto(`${projectPath}/members`);
    await expect(pageB.getByText("Inviter un collaborateur")).toHaveCount(0);
    const history = await pageB.goto(`${projectPath}/history`);
    expect(history?.status()).toBe(404);

    await pageB.goto(inviteLink);
    await expect(pageB.getByText(/invalide ou a expiré/)).toBeVisible();

    await contextB.close();
  });
});
