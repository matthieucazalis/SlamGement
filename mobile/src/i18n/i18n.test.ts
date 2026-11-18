import { describe, expect, it } from "vitest";
import {
  LANGUES,
  creerTraducteur,
  estLangue,
  formaterDate,
  langueDepuisCode,
  traduire,
} from "./index";
import { messages } from "./messages";

function aplatir(arbre: object, prefixe = ""): Record<string, string> {
  return Object.entries(arbre).reduce<Record<string, string>>(
    (acc, [cle, valeur]) => {
      const chemin = prefixe ? `${prefixe}.${cle}` : cle;
      return typeof valeur === "string"
        ? { ...acc, [chemin]: valeur }
        : { ...acc, ...aplatir(valeur as object, chemin) };
    },
    {},
  );
}
const variables = (texte: string) =>
  [...texte.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("dictionnaires", () => {
  const fr = aplatir(messages.fr);

  it.each(LANGUES.filter((l) => l !== "fr"))(
    "%s a exactement les mêmes clés que le français",
    (langue) => {
      expect(Object.keys(aplatir(messages[langue])).sort()).toEqual(
        Object.keys(fr).sort(),
      );
    },
  );

  it.each(LANGUES.filter((l) => l !== "fr"))(
    "%s garde les mêmes variables {…} que le français",
    (langue) => {
      const autre = aplatir(messages[langue]);
      for (const [cle, texte] of Object.entries(fr))
        expect(variables(autre[cle]), `${langue}:${cle}`).toEqual(
          variables(texte),
        );
    },
  );

  it.each(LANGUES)("%s : aucune traduction vide", (langue) => {
    for (const [cle, texte] of Object.entries(aplatir(messages[langue])))
      expect(texte.trim(), `${langue}:${cle}`).not.toBe("");
  });

  it("couvre tous les codes d'erreur de l'API", () => {
    for (const code of [
      "reseau",
      "delai",
      "non_authentifie",
      "identifiants",
      "trop_de_tentatives",
      "introuvable",
      "conflit",
      "validation",
      "image",
      "serveur",
      "inconnue",
    ])
      expect(Object.keys(messages.fr.erreurs)).toContain(code);
  });
});

describe("traduire", () => {
  it("remplace les variables et change selon la langue", () => {
    expect(traduire("fr", "adr.remplacePar", { numero: "0002" })).toBe(
      "Remplacé par l'ADR-0002",
    );
    expect(traduire("en", "adr.remplacePar", { numero: "0002" })).toBe(
      "Superseded by ADR-0002",
    );
    expect(traduire("de", "adr.remplacePar", { numero: "0002" })).toBe(
      "Ersetzt durch ADR-0002",
    );
  });

  it("laisse une variable inconnue telle quelle", () => {
    expect(traduire("fr", "projets.role", {})).toBe("Rôle : {role}");
  });

  it("creerTraducteur fixe la langue", () => {
    expect(creerTraducteur("de")("connexion.seConnecter")).toBe("Anmelden");
  });
});

describe("langue", () => {
  it("reconnaît les langues gérées", () => {
    expect(estLangue("de")).toBe(true);
    expect(estLangue("es")).toBe(false);
    expect(estLangue(null)).toBe(false);
  });

  it("déduit la langue du code de l'appareil, avec repli sur le français", () => {
    expect(langueDepuisCode("de")).toBe("de");
    expect(langueDepuisCode("en-GB")).toBe("en");
    expect(langueDepuisCode("fr_CA")).toBe("fr");
    expect(langueDepuisCode("ja")).toBe("fr");
    expect(langueDepuisCode(undefined)).toBe("fr");
  });

  it("formate une date, et renvoie du vide pour une date invalide", () => {
    expect(formaterDate("2026-01-15T12:00:00Z", "fr")).toMatch(/15/);
    expect(formaterDate("pas une date", "fr")).toBe("");
  });
});
