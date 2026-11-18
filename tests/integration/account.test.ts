import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { DELETED_USER_NAME } from "@/lib/labels";
import {
  LastAdminBlockedError,
  deleteAccount,
  exportUserData,
} from "@/services/account.service";
import { createAdr } from "@/services/adr.service";
import { createTask } from "@/services/task.service";
import { verifyCredentials, WrongPasswordError } from "@/services/user.service";
import {
  ADR_INPUT,
  PASSWORD,
  addMember,
  cleanup,
  makeProject,
  makeUser,
  taskInput,
} from "./helpers";

describe("compte (RGPD)", () => {
  const ids: string[] = [];
  afterAll(() => cleanup(ids));

  it("exporte les données sans jamais inclure le mot de passe", async () => {
    const user = await makeUser("export");
    ids.push(user.id);
    const project = await makeProject(user.id, "Projet exporté");
    await createAdr(user.id, project.id, ADR_INPUT);

    const data = await exportUserData(user.id);
    expect(data.profile.email).toBe(user.email);
    expect(data.projects).toEqual([
      { project: "Projet exporté", role: "ADMIN" },
    ]);
    expect(data.decisions).toHaveLength(1);

    const json = JSON.stringify(data);
    expect(json).not.toContain("passwordHash");
    expect(json).not.toContain(user.passwordHash);
  });

  it("refuse la suppression avec un mauvais mot de passe", async () => {
    const user = await makeUser("wrongpwd");
    ids.push(user.id);
    await expect(deleteAccount(user.id, "mauvais")).rejects.toThrow(
      WrongPasswordError,
    );
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
        .deletedAt,
    ).toBeNull();
  });

  it("anonymise le compte, garde les décisions partagées, supprime les projets solo", async () => {
    const leaver = await makeUser("leaver");
    const colleague = await makeUser("colleague");
    ids.push(leaver.id, colleague.id);

    const shared = await makeProject(colleague.id, "Projet partagé");
    await addMember(shared.id, leaver.id);
    const adr = await createAdr(leaver.id, shared.id, ADR_INPUT);
    await createTask(
      colleague.id,
      shared.id,
      taskInput({ title: "T", assigneeId: leaver.id }),
    );
    const solo = await makeProject(leaver.id, "Projet solo");

    await deleteAccount(leaver.id, PASSWORD);

    const after = await prisma.user.findUniqueOrThrow({
      where: { id: leaver.id },
    });
    expect(after.name).toBe(DELETED_USER_NAME);
    expect(after.email).not.toBe(leaver.email);
    expect(after.email).toMatch(/@deleted\.invalid$/);
    expect(after.avatar).toBeNull();
    expect(after.deletedAt).not.toBeNull();

    // le projet partagé et sa décision restent, rattachés à l'utilisateur anonyme
    expect(
      await prisma.project.findUnique({ where: { id: shared.id } }),
    ).not.toBeNull();
    const keptAdr = await prisma.adr.findUniqueOrThrow({
      where: { id: adr.id },
    });
    expect(keptAdr.authorId).toBe(leaver.id);
    expect(
      await prisma.membership.count({ where: { userId: leaver.id } }),
    ).toBe(0);
    expect(await prisma.task.count({ where: { assigneeId: leaver.id } })).toBe(
      0,
    );
    // le projet dont il était le seul membre disparaît
    expect(
      await prisma.project.findUnique({ where: { id: solo.id } }),
    ).toBeNull();

    // plus aucune connexion possible, ni avec l'ancien email, ni avec le mot de passe
    expect(await verifyCredentials(leaver.email, PASSWORD)).toBeNull();
    expect(await verifyCredentials(after.email, PASSWORD)).toBeNull();

    // l'événement est tracé, sans donnée personnelle
    const log = await prisma.auditLog.findFirstOrThrow({
      where: { userId: leaver.id, action: "ACCOUNT_DELETED" },
    });
    expect(log.projectId).toBeNull();
  });

  it("refuse de supprimer le dernier administrateur d'un projet partagé", async () => {
    const admin = await makeUser("lastadmin");
    const other = await makeUser("other");
    ids.push(admin.id, other.id);
    const project = await makeProject(admin.id, "Projet à garder");
    await addMember(project.id, other.id);

    await expect(deleteAccount(admin.id, PASSWORD)).rejects.toThrow(
      LastAdminBlockedError,
    );
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: admin.id } }))
        .deletedAt,
    ).toBeNull();

    // une fois un autre administrateur nommé, la suppression passe
    await prisma.membership.updateMany({
      where: { projectId: project.id, userId: other.id },
      data: { role: "ADMIN" },
    });
    await expect(deleteAccount(admin.id, PASSWORD)).resolves.toBeUndefined();
  });
});
