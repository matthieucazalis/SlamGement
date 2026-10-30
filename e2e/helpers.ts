import { expect, type Page } from "@playwright/test";

export const PASSWORD = "Motdepasse-e2e-1";

export function uniqueEmail(prefix = "user") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.test`;
}

export async function register(
  page: Page,
  name: string,
  email: string,
  password = PASSWORD,
) {
  await page.goto("/register");
  await page.getByLabel("Nom", { exact: true }).fill(name);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await page.waitForURL(/\/login\?registered=1/);
}

export async function login(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

export async function signUpAndLogin(page: Page, name = "Testeur") {
  const email = uniqueEmail();
  await register(page, name, email);
  await login(page, email);
  await expect(
    page.getByRole("heading", { name: "Mes projets" }),
  ).toBeVisible();
  return email;
}

export async function createProject(page: Page, name: string) {
  await page.getByLabel("Nom", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Créer le projet" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  return new URL(page.url()).pathname;
}

type AdrData = {
  title: string;
  context?: string;
  decision?: string;
  consequences?: string;
  mermaid?: string;
};

export async function createAdr(page: Page, projectPath: string, adr: AdrData) {
  await page.goto(`${projectPath}/adr/new`);
  await page.getByLabel("Titre", { exact: true }).fill(adr.title);
  await page
    .getByLabel("Contexte", { exact: true })
    .fill(adr.context ?? "Contexte de test suffisamment long.");
  await page
    .getByLabel("Décision", { exact: true })
    .fill(adr.decision ?? "Décision de test suffisamment longue.");
  await page
    .getByLabel("Conséquences", { exact: true })
    .fill(adr.consequences ?? "Conséquences de test suffisamment longues.");
  if (adr.mermaid) {
    await page.getByLabel("Schéma Mermaid").fill(adr.mermaid);
  }
  await page.getByRole("button", { name: "Créer l'ADR" }).click();
  await page.waitForURL(/\/adr\/\d+$/);
  return Number(page.url().match(/\/adr\/(\d+)$/)![1]);
}
