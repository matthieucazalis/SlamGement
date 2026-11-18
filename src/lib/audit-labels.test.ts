import { describe, expect, it } from "vitest";
import { createTranslator } from "@/i18n/translate";
import { describeAudit } from "./audit-labels";

const t = createTranslator("fr");

describe("describeAudit", () => {
  it("décrit un changement de statut", () => {
    expect(
      describeAudit(t, "ADR_STATUS_CHANGED", {
        number: 3,
        from: "PROPOSED",
        to: "ACCEPTED",
      }),
    ).toBe("a fait passer ADR-0003 de Proposé à Accepté");
  });

  it("mentionne l'ADR remplaçant", () => {
    expect(
      describeAudit(t, "ADR_STATUS_CHANGED", {
        number: 3,
        from: "ACCEPTED",
        to: "SUPERSEDED",
        supersededBy: 4,
      }),
    ).toBe(
      "a fait passer ADR-0003 de Accepté à Remplacé (remplacé par ADR-0004)",
    );
  });

  it("traduit les champs modifiés", () => {
    expect(
      describeAudit(t, "ADR_UPDATED", {
        number: 1,
        fields: ["title", "mermaidCode"],
      }),
    ).toBe("a modifié ADR-0001 (titre, schéma)");
  });

  it("décrit le déplacement d'une tâche", () => {
    expect(
      describeAudit(t, "TASK_MOVED", {
        title: "Écrire le MCD",
        from: "TODO",
        to: "IN_PROGRESS",
      }),
    ).toBe("a déplacé la tâche « Écrire le MCD » de À faire à En cours");
  });

  it("décrit la création et la suppression d'une tâche", () => {
    expect(describeAudit(t, "TASK_CREATED", { title: "Écrire le MCD" })).toBe(
      "a créé la tâche « Écrire le MCD »",
    );
    expect(describeAudit(t, "TASK_DELETED", { title: "Écrire le MCD" })).toBe(
      "a supprimé la tâche « Écrire le MCD »",
    );
  });

  it("ne plante pas si les métadonnées sont absentes ou invalides", () => {
    expect(describeAudit(t, "ADR_CREATED", null)).toBe("a créé un ADR");
    expect(describeAudit(t, "ADR_CREATED", "n'importe quoi")).toBe(
      "a créé un ADR",
    );
  });

  it("renvoie le code brut pour une action inconnue", () => {
    expect(describeAudit(t, "AUTRE", {})).toBe("AUTRE");
  });
});

describe("describeAudit dans les autres langues", () => {
  const meta = { number: 3, from: "PROPOSED", to: "ACCEPTED" };

  it("décrit un changement de statut en anglais", () => {
    expect(
      describeAudit(createTranslator("en"), "ADR_STATUS_CHANGED", meta),
    ).toBe("moved ADR-0003 from Proposed to Accepted");
  });

  it("décrit un changement de statut en allemand", () => {
    expect(
      describeAudit(createTranslator("de"), "ADR_STATUS_CHANGED", meta),
    ).toBe("hat ADR-0003 von Vorgeschlagen auf Akzeptiert gesetzt");
  });

  it("utilise les guillemets de chaque langue", () => {
    const m = { name: "Atlas" };
    expect(describeAudit(createTranslator("fr"), "PROJECT_CREATED", m)).toBe(
      "a créé le projet « Atlas »",
    );
    expect(describeAudit(createTranslator("en"), "PROJECT_CREATED", m)).toBe(
      "created the project “Atlas”",
    );
    expect(describeAudit(createTranslator("de"), "PROJECT_CREATED", m)).toBe(
      "hat das Projekt „Atlas“ erstellt",
    );
  });
});
