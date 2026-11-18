import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/lib/permissions";
import {
  changeAdrStatus,
  createAdr,
  deleteAdr,
  listAdrs,
} from "@/services/adr.service";
import {
  ADR_INPUT,
  addMember,
  cleanup,
  makeProject,
  makeUser,
} from "./helpers";

describe("ADR", () => {
  let admin: Awaited<ReturnType<typeof makeUser>>;
  let member: Awaited<ReturnType<typeof makeUser>>;
  let outsider: Awaited<ReturnType<typeof makeUser>>;
  let projectId: string;

  beforeAll(async () => {
    admin = await makeUser("admin");
    member = await makeUser("member");
    outsider = await makeUser("outsider");
    projectId = (await makeProject(admin.id)).id;
    await addMember(projectId, member.id);
  });
  afterAll(() => cleanup([admin.id, member.id, outsider.id]));

  it("numérote sans doublon, même avec des créations simultanées", async () => {
    const created = await Promise.all(
      Array.from({ length: 6 }, () =>
        createAdr(admin.id, projectId, ADR_INPUT),
      ),
    );
    const numbers = created.map((a) => a.number).sort((a, b) => a - b);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("ne réattribue jamais le numéro d'un ADR supprimé", async () => {
    const last = await createAdr(admin.id, projectId, ADR_INPUT);
    await deleteAdr(admin.id, projectId, last.number);
    const next = await createAdr(admin.id, projectId, ADR_INPUT);
    expect(next.number).toBe(last.number + 1);
  });

  it("interdit l'accès à une personne qui n'est pas membre", async () => {
    await expect(createAdr(outsider.id, projectId, ADR_INPUT)).rejects.toThrow(
      ForbiddenError,
    );
    await expect(listAdrs(outsider.id, projectId)).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("refuse qu'un ADR soit remplacé par un ADR rejeté ou déjà remplacé", async () => {
    const a = await createAdr(member.id, projectId, ADR_INPUT);
    const rejected = await createAdr(member.id, projectId, ADR_INPUT);
    await changeAdrStatus(member.id, projectId, rejected.number, "REJECTED");
    await changeAdrStatus(member.id, projectId, a.number, "ACCEPTED");

    await expect(
      changeAdrStatus(
        member.id,
        projectId,
        a.number,
        "SUPERSEDED",
        rejected.number,
      ),
    ).rejects.toThrow();

    const replacement = await createAdr(member.id, projectId, ADR_INPUT);
    await changeAdrStatus(
      member.id,
      projectId,
      a.number,
      "SUPERSEDED",
      replacement.number,
    );

    const b = await createAdr(member.id, projectId, ADR_INPUT);
    await changeAdrStatus(member.id, projectId, b.number, "ACCEPTED");
    // `a` est déjà remplacé : il ne peut plus servir de remplaçant
    await expect(
      changeAdrStatus(member.id, projectId, b.number, "SUPERSEDED", a.number),
    ).rejects.toThrow();
  });

  it("refuse une transition de statut interdite", async () => {
    const adr = await createAdr(member.id, projectId, ADR_INPUT);
    await changeAdrStatus(member.id, projectId, adr.number, "REJECTED");
    await expect(
      changeAdrStatus(member.id, projectId, adr.number, "ACCEPTED"),
    ).rejects.toThrow();
  });

  it("recherche par texte (insensible à la casse, sans interpréter % et _)", async () => {
    await createAdr(admin.id, projectId, {
      ...ADR_INPUT,
      title: "Choisir PostgreSQL",
    });
    await createAdr(admin.id, projectId, {
      ...ADR_INPUT,
      title: "Cache à 100% fiable",
    });

    const pg = await listAdrs(admin.id, projectId, undefined, "postgresql");
    expect(pg.map((a) => a.title)).toContain("Choisir PostgreSQL");

    // « % » est cherché littéralement, il ne fait pas office de joker
    const percent = await listAdrs(admin.id, projectId, undefined, "100%");
    expect(percent.map((a) => a.title)).toEqual(["Cache à 100% fiable"]);

    const none = await listAdrs(
      admin.id,
      projectId,
      undefined,
      "zzz-introuvable",
    );
    expect(none).toHaveLength(0);
  });

  it("enregistre chaque changement dans l'historique", async () => {
    const adr = await createAdr(admin.id, projectId, ADR_INPUT);
    await changeAdrStatus(admin.id, projectId, adr.number, "ACCEPTED");
    const logs = await prisma.auditLog.findMany({
      where: { projectId, entityId: adr.id },
      orderBy: { createdAt: "asc" },
    });
    expect(logs.map((l) => l.action)).toEqual([
      "ADR_CREATED",
      "ADR_STATUS_CHANGED",
    ]);
  });
});
