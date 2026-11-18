import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/lib/permissions";
import { createInvitation } from "@/services/invitation.service";
import {
  LastAdminError,
  changeMemberRole,
  removeMember,
} from "@/services/member.service";
import { createTask, listTasks } from "@/services/task.service";
import {
  addMember,
  cleanup,
  makeProject,
  makeUser,
  taskInput,
} from "./helpers";

describe("membres et tâches", () => {
  let admin: Awaited<ReturnType<typeof makeUser>>;
  let member: Awaited<ReturnType<typeof makeUser>>;
  let projectId: string;
  let memberMembershipId: string;

  beforeAll(async () => {
    admin = await makeUser("admin");
    member = await makeUser("member");
    projectId = (await makeProject(admin.id)).id;
    memberMembershipId = (await addMember(projectId, member.id)).id;
  });
  afterAll(() => cleanup([admin.id, member.id]));

  it("un simple membre ne peut ni inviter ni changer un rôle", async () => {
    await expect(
      createInvitation(member.id, projectId, "x@test.local", "MEMBER"),
    ).rejects.toThrow(ForbiddenError);
    await expect(
      changeMemberRole(member.id, projectId, memberMembershipId, "ADMIN"),
    ).rejects.toThrow(ForbiddenError);
  });

  it("le dernier administrateur ne peut pas quitter le projet", async () => {
    const adminMembership = await prisma.membership.findFirstOrThrow({
      where: { projectId, userId: admin.id },
    });
    await expect(
      removeMember(admin.id, projectId, adminMembership.id),
    ).rejects.toThrow(LastAdminError);
  });

  it("retirer un membre désassigne ses tâches", async () => {
    await createTask(
      admin.id,
      projectId,
      taskInput({
        title: "Tâche de test",
        assigneeId: member.id,
      }),
    );
    expect(
      (await listTasks(admin.id, projectId, { assigneeId: member.id })).length,
    ).toBe(1);

    await removeMember(admin.id, projectId, memberMembershipId);

    const orphaned = await prisma.task.count({
      where: { projectId, assigneeId: member.id },
    });
    expect(orphaned).toBe(0);
  });

  it("filtre les tâches par texte", async () => {
    await createTask(
      admin.id,
      projectId,
      taskInput({ title: "Écrire la documentation" }),
    );
    await createTask(
      admin.id,
      projectId,
      taskInput({ title: "Corriger un bug" }),
    );
    const found = await listTasks(admin.id, projectId, {
      search: "DOCUMENTATION",
    });
    expect(found.map((t) => t.title)).toEqual(["Écrire la documentation"]);
  });
});
