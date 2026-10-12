import { describe, expect, it } from "vitest";
import {
  adrFileName,
  adrToMarkdown,
  slugify,
  type AdrExportInput,
} from "./adr-markdown";

const base: AdrExportInput = {
  number: 1,
  title: "Choix de la base de données",
  status: "ACCEPTED",
  createdAt: new Date("2026-10-12T10:00:00Z"),
  context: "Nous avons besoin d'une base relationnelle.",
  decision: "PostgreSQL.",
  consequences: "Hébergement à prévoir.",
  alternatives: null,
  mermaidCode: null,
  author: { name: "Matthieu" },
  supersededBy: null,
  supersedes: null,
};

describe("slugify et noms de fichier", () => {
  it("retire les accents et la ponctuation", () => {
    expect(slugify("Choix de la base de données")).toBe(
      "choix-de-la-base-de-donnees",
    );
  });

  it("donne un nom de repli si le titre est vide de lettres", () => {
    expect(slugify("???")).toBe("adr");
  });

  it("numérote le fichier sur 4 chiffres", () => {
    expect(adrFileName(3, "Hébergement")).toBe("0003-hebergement.md");
  });
});

describe("export Markdown d'un ADR", () => {
  it("contient le titre, le statut et la date", () => {
    const md = adrToMarkdown(base);
    expect(md).toContain("# ADR-0001 : Choix de la base de données");
    expect(md).toContain("- Statut : accepted");
    expect(md).toContain("- Date : 2026-10-12");
  });

  it("omet les sections facultatives vides", () => {
    const md = adrToMarkdown(base);
    expect(md).not.toContain("## Alternatives étudiées");
    expect(md).not.toContain("## Schéma");
  });

  it("inclut le schéma dans un bloc mermaid", () => {
    const md = adrToMarkdown({ ...base, mermaidCode: "graph TD; A-->B" });
    expect(md).toContain("```mermaid\ngraph TD; A-->B\n```");
  });

  it("allonge la clôture si le code contient déjà des ```", () => {
    const md = adrToMarkdown({ ...base, mermaidCode: "a\n```\nb" });
    expect(md).toContain("````mermaid");
  });

  it("référence l'ADR remplaçant dans le statut", () => {
    const md = adrToMarkdown({
      ...base,
      status: "SUPERSEDED",
      supersededBy: { number: 2, title: "Migration vers Mongo" },
    });
    expect(md).toContain(
      "- Statut : superseded by [ADR-0002](0002-migration-vers-mongo.md)",
    );
  });

  it("référence l'ADR remplacé", () => {
    const md = adrToMarkdown({
      ...base,
      number: 2,
      supersedes: { number: 1, title: "Choix de la base de données" },
    });
    expect(md).toContain(
      "- Remplace : [ADR-0001](0001-choix-de-la-base-de-donnees.md)",
    );
  });
});
