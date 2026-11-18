import { describe, expect, it } from "vitest";
import { isAcceptableMermaid } from "./mermaid-check";
import { messageSchema } from "./validators/chat";
import { adrSchema } from "./validators/adr";

describe("isAcceptableMermaid", () => {
  it("accepte de vrais schémas", () => {
    expect(isAcceptableMermaid("flowchart TD\n  A --> B")).toBe(true);
    expect(isAcceptableMermaid("%% commentaire\nsequenceDiagram\n A->>B: hi")).toBe(true);
  });
  it("refuse ce qui n'est pas un schéma ou une directive", () => {
    expect(isAcceptableMermaid("bonjour tout le monde")).toBe(false);
    expect(isAcceptableMermaid("<script>alert(1)</script>")).toBe(false);
    expect(isAcceptableMermaid("%%{init: {'securityLevel':'loose'}}%%\ngraph TD\nA-->B")).toBe(false);
  });
});

describe("messageSchema", () => {
  it("accepte du texte simple et le nettoie", () => {
    expect(messageSchema.parse({ body: "  salut  " }).body).toBe("salut");
  });
  it("refuse vide, trop long, NUL et caractères invisibles", () => {
    expect(messageSchema.safeParse({ body: "   " }).success).toBe(false);
    expect(messageSchema.safeParse({ body: "a".repeat(2001) }).success).toBe(false);
    expect(messageSchema.safeParse({ body: "a\u0000b" }).success).toBe(false);
    expect(messageSchema.safeParse({ body: "a\u202Eb" }).success).toBe(false);
  });
  it("garde les caractères d'injection comme du texte inerte", () => {
    expect(messageSchema.parse({ body: "'; DROP TABLE \"User\"; --" }).body).toContain("DROP");
  });
});

describe("adrSchema", () => {
  const base = {
    title: "Titre ok",
    context: "Un contexte assez long",
    decision: "Une décision assez longue",
    consequences: "Des conséquences assez longues",
  };
  it("refuse un schéma invalide ou un caractère NUL", () => {
    expect(adrSchema.safeParse({ ...base, mermaidCode: "pas un schéma" }).success).toBe(false);
    expect(adrSchema.safeParse({ ...base, context: "contexte\u0000long" }).success).toBe(false);
  });
  it("accepte un schéma valide ou l'absence de schéma", () => {
    expect(adrSchema.safeParse({ ...base, mermaidCode: "graph TD\nA-->B" }).success).toBe(true);
    expect(adrSchema.safeParse({ ...base, mermaidCode: "" }).success).toBe(true);
  });
});
