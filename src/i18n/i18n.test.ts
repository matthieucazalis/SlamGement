import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { LOCALES, isLocale, matchLocale } from "./config";
import { messages } from "./messages";
import { createTranslator, translate } from "./translate";
import { firstIssueMessage } from "@/lib/validators/messages";
import { adrSchema } from "@/lib/validators/adr";
import { registerSchema } from "@/lib/validators/auth";

// Aplatit un dictionnaire en { "domaine.cle": "texte" }
function flatten(tree: object, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return typeof value === "string"
        ? { ...acc, [path]: value }
        : { ...acc, ...flatten(value as object, path) };
    },
    {},
  );
}

const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("dictionnaires", () => {
  const fr = flatten(messages.fr);

  it.each(LOCALES.filter((l) => l !== "fr"))(
    "%s a exactement les mêmes clés que le français",
    (locale) => {
      const other = flatten(messages[locale]);
      expect(Object.keys(other).sort()).toEqual(Object.keys(fr).sort());
    },
  );

  it.each(LOCALES)("%s : aucune traduction vide", (locale) => {
    for (const [key, text] of Object.entries(flatten(messages[locale])))
      if (key !== "common.notAvailable")
        expect(text.trim(), `${locale}:${key}`).not.toBe("");
  });

  it.each(LOCALES.filter((l) => l !== "fr"))(
    "%s garde les mêmes variables {…} que le français",
    (locale) => {
      const other = flatten(messages[locale]);
      for (const [key, text] of Object.entries(fr))
        expect(placeholders(other[key]), `${locale}:${key}`).toEqual(
          placeholders(text),
        );
    },
  );

  it.each(LOCALES.filter((l) => l !== "fr"))(
    "%s : les pluriels « a|b » existent dans les deux langues ou aucune",
    (locale) => {
      const other = flatten(messages[locale]);
      for (const [key, text] of Object.entries(fr))
        expect(other[key].includes("|"), `${locale}:${key}`).toBe(
          text.includes("|"),
        );
    },
  );
});

describe("translate", () => {
  it("remplace les variables", () => {
    expect(translate("fr", "projects.yourRole", { role: "Membre" })).toBe(
      "Ton rôle : Membre",
    );
    expect(translate("en", "projects.yourRole", { role: "Member" })).toBe(
      "Your role: Member",
    );
  });

  it("accorde le pluriel (0 et 1 au singulier en français)", () => {
    expect(translate("fr", "history.count", { count: 0 })).toBe("0 action");
    expect(translate("fr", "history.count", { count: 1 })).toBe("1 action");
    expect(translate("fr", "history.count", { count: 2 })).toBe("2 actions");
  });

  it("accorde le pluriel (0 au pluriel en anglais et en allemand)", () => {
    expect(translate("en", "history.count", { count: 0 })).toBe("0 actions");
    expect(translate("en", "history.count", { count: 1 })).toBe("1 action");
    expect(translate("de", "history.count", { count: 1 })).toBe("1 Aktion");
    expect(translate("de", "history.count", { count: 5 })).toBe("5 Aktionen");
  });

  it("laisse une variable inconnue telle quelle", () => {
    expect(translate("fr", "projects.yourRole", {})).toBe("Ton rôle : {role}");
  });

  it("renvoie des textes différents selon la langue", () => {
    expect(createTranslator("fr")("auth.login")).toBe("Se connecter");
    expect(createTranslator("en")("auth.login")).toBe("Sign in");
    expect(createTranslator("de")("auth.login")).toBe("Anmelden");
  });
});

describe("langue", () => {
  it("reconnaît les langues gérées", () => {
    expect(isLocale("de")).toBe(true);
    expect(isLocale("es")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it("choisit la langue selon Accept-Language", () => {
    expect(matchLocale("de-DE,de;q=0.9,en;q=0.8")).toBe("de");
    expect(matchLocale("en-US,en;q=0.9")).toBe("en");
    expect(matchLocale("es-ES,es;q=0.9,en;q=0.5")).toBe("en");
    expect(matchLocale("fr-CA")).toBe("fr");
  });

  it("tient compte des poids q", () => {
    expect(matchLocale("en;q=0.5,de;q=0.9")).toBe("de");
  });

  it("retombe sur le français par défaut", () => {
    expect(matchLocale(null)).toBe("fr");
    expect(matchLocale("")).toBe("fr");
    expect(matchLocale("ja,zh;q=0.8")).toBe("fr");
    expect(matchLocale("n'importe;quoi;;")).toBe("fr");
  });
});

describe("messages de validation traduits", () => {
  it("traduit l'erreur d'un schéma Zod selon la langue", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "x@y.fr",
      password: "motdepasse",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(firstIssueMessage(createTranslator("fr"), result.error)).toBe(
      "2 caractères minimum",
    );
    expect(firstIssueMessage(createTranslator("en"), result.error)).toBe(
      "At least 2 characters",
    );
    expect(firstIssueMessage(createTranslator("de"), result.error)).toBe(
      "Mindestens 2 Zeichen",
    );
  });

  it("traduit les messages propres à chaque champ ADR", () => {
    const result = adrSchema.safeParse({
      title: "Un titre",
      context: "court",
      decision: "une décision assez longue",
      consequences: "des conséquences assez longues",
    });
    if (result.success) throw new Error("devrait échouer");
    expect(firstIssueMessage(createTranslator("en"), result.error)).toBe(
      "Context: at least 10 characters",
    );
  });

  it("retombe sur un message générique pour une erreur sans clé", () => {
    const error = new ZodError([
      { code: "custom", path: ["x"], message: "Too big: expected string" },
    ]);
    expect(firstIssueMessage(createTranslator("de"), error)).toBe(
      "Ungültige Daten.",
    );
  });
});
