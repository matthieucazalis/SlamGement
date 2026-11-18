import { describe, expect, it } from "vitest";
import {
  estEnRetard,
  formaterNumeroAdr,
  lireNumero,
  statutPrecedent,
  statutSuivant,
  transitionsPossibles,
  validerNouvelAdr,
} from "./regles";

describe("transitions d'ADR", () => {
  it("reproduit les règles du site", () => {
    expect(transitionsPossibles("PROPOSED")).toEqual(["ACCEPTED", "REJECTED"]);
    expect(transitionsPossibles("ACCEPTED")).toEqual([
      "DEPRECATED",
      "SUPERSEDED",
    ]);
    expect(transitionsPossibles("REJECTED")).toEqual(["PROPOSED"]);
  });

  it("n'offre aucune transition depuis un statut final", () => {
    expect(transitionsPossibles("DEPRECATED")).toEqual([]);
    expect(transitionsPossibles("SUPERSEDED")).toEqual([]);
  });
});

describe("colonnes du Kanban", () => {
  it("avance et recule d'une colonne, sans dépasser les bords", () => {
    expect(statutSuivant("TODO")).toBe("IN_PROGRESS");
    expect(statutSuivant("REVIEW")).toBe("DONE");
    expect(statutSuivant("DONE")).toBeNull();
    expect(statutPrecedent("DONE")).toBe("REVIEW");
    expect(statutPrecedent("TODO")).toBeNull();
  });
});

describe("estEnRetard", () => {
  const maintenant = new Date("2026-11-12T10:00:00Z");

  it("une échéance passée est en retard", () => {
    expect(estEnRetard("2026-11-11T00:00:00.000Z", "TODO", maintenant)).toBe(
      true,
    );
  });

  it("l'échéance d'aujourd'hui n'est pas en retard", () => {
    expect(estEnRetard("2026-11-12T00:00:00.000Z", "TODO", maintenant)).toBe(
      false,
    );
  });

  it("une tâche terminée n'est jamais en retard, ni une tâche sans échéance", () => {
    expect(estEnRetard("2026-01-01T00:00:00.000Z", "DONE", maintenant)).toBe(
      false,
    );
    expect(estEnRetard(null, "TODO", maintenant)).toBe(false);
  });
});

describe("numéros d'ADR", () => {
  it("formate sur 4 chiffres", () => {
    expect(formaterNumeroAdr(3)).toBe("0003");
    expect(formaterNumeroAdr(42)).toBe("0042");
  });

  it("convertit le texte de l'URL en nombre (useLocalSearchParams renvoie du texte)", () => {
    expect(lireNumero("7")).toBe(7);
    expect(lireNumero(["7", "8"])).toBe(7);
  });

  it("refuse tout ce qui n'est pas un entier positif", () => {
    for (const mauvais of ["0", "-1", "1.5", "abc", "", undefined, "1e2x"])
      expect(lireNumero(mauvais), String(mauvais)).toBeNull();
  });
});

describe("validerNouvelAdr", () => {
  const ok = {
    title: "Titre",
    context: "x".repeat(10),
    decision: "y".repeat(10),
    consequences: "z".repeat(10),
  };

  it("accepte un ADR complet", () => {
    expect(validerNouvelAdr(ok)).toEqual([]);
  });

  it("liste les champs trop courts, en ignorant les espaces", () => {
    expect(
      validerNouvelAdr({ ...ok, title: "ab", context: "   court   " }),
    ).toEqual(["title", "context"]);
    expect(
      validerNouvelAdr({
        title: "",
        context: "",
        decision: "",
        consequences: "",
      }),
    ).toHaveLength(4);
  });
});
