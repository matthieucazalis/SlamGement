import { expect, test } from "@playwright/test";
import { createAdr, createProject, signUpAndLogin } from "./helpers";

test("Kanban : créer une tâche, la lier à un ADR et la déplacer", async ({
  page,
}) => {
  await signUpAndLogin(page);
  const projectPath = await createProject(page, "Projet Kanban e2e");
  await createAdr(page, projectPath, { title: "Choix de la base" });

  await page.goto(`${projectPath}/kanban`);
  await page.getByText("Nouvelle tâche", { exact: true }).click();
  await page.getByLabel("Titre", { exact: true }).fill("Écrire le MCD");
  await page.getByLabel("Décision liée").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Ajouter la tâche" }).click();

  const todo = page.getByRole("region", { name: "À faire" });
  await expect(todo.getByText("Écrire le MCD")).toBeVisible();
  await expect(todo.getByRole("link", { name: /ADR-0001/ })).toBeVisible();

  await todo.getByRole("button", { name: "Déplacer vers En cours" }).click();
  await expect(
    page.getByRole("region", { name: "En cours" }).getByText("Écrire le MCD"),
  ).toBeVisible();
  await expect(todo.getByText("Écrire le MCD")).toHaveCount(0);

  // la tâche apparaît côté ADR
  await page.goto(`${projectPath}/adr/1`);
  await expect(
    page.getByRole("heading", { name: "Tâches liées" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Écrire le MCD" })).toBeVisible();
});
