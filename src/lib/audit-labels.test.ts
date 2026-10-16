import { describe, expect, it } from "vitest";
import { describeAudit } from "./audit-labels";

describe("describeAudit", () => {
  it("décrit un changement de statut", () => {
    expect(
      describeAudit("ADR_STATUS_CHANGED", {
        number: 3,
        from: "PROPOSED",
        to: "ACCEPTED",
      }),
    ).toBe("a fait passer ADR-0003 de Proposé à Accepté");
  });

  it("mentionne l'ADR remplaçant", () => {
    expect(
      describeAudit("ADR_STATUS_CHANGED", {
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
      describeAudit("ADR_UPDATED", {
        number: 1,
        fields: ["title", "mermaidCode"],
      }),
    ).toBe("a modifié ADR-0001 (titre, schéma)");
  });

  it("ne plante pas si les métadonnées sont absentes ou invalides", () => {
    expect(describeAudit("ADR_CREATED", null)).toBe("a créé un ADR");
    expect(describeAudit("ADR_CREATED", "n'importe quoi")).toBe(
      "a créé un ADR",
    );
  });

  it("renvoie le code brut pour une action inconnue", () => {
    expect(describeAudit("AUTRE", {})).toBe("AUTRE");
  });
});
