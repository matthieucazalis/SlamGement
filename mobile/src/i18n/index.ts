import { messages, type Messages } from "./messages";

export const LANGUES = ["fr", "en", "de"] as const;
export type Langue = (typeof LANGUES)[number];
export const LANGUE_PAR_DEFAUT: Langue = "fr";

// Nom de chaque langue écrit dans sa propre langue
export const NOMS_LANGUES: Record<Langue, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
};
const BALISES: Record<Langue, string> = {
  fr: "fr-FR",
  en: "en-GB",
  de: "de-DE",
};

type Feuilles<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : Feuilles<T[K], `${P}${K}.`>;
}[keyof T & string];

export type Cle = Feuilles<Messages>;
export type Params = Record<string, string | number>;
export type Traducteur = (cle: Cle, params?: Params) => string;

export function estLangue(valeur: unknown): valeur is Langue {
  return (
    typeof valeur === "string" &&
    (LANGUES as readonly string[]).includes(valeur)
  );
}

// « de-DE » → « de » ; une langue non gérée retombe sur le français
export function langueDepuisCode(code: string | null | undefined): Langue {
  const court = code?.toLowerCase().split(/[-_]/)[0];
  return estLangue(court) ? court : LANGUE_PAR_DEFAUT;
}

function chercher(arbre: unknown, cle: string): string | undefined {
  let noeud = arbre;
  for (const morceau of cle.split(".")) {
    if (noeud && typeof noeud === "object" && morceau in noeud)
      noeud = (noeud as Record<string, unknown>)[morceau];
    else return undefined;
  }
  return typeof noeud === "string" ? noeud : undefined;
}

export function traduire(langue: Langue, cle: Cle, params?: Params): string {
  const texte =
    chercher(messages[langue], cle) ?? chercher(messages.fr, cle) ?? cle;
  if (!params) return texte;
  return texte.replace(/\{(\w+)\}/g, (brut, nom: string) =>
    nom in params ? String(params[nom]) : brut,
  );
}

export const creerTraducteur =
  (langue: Langue): Traducteur =>
  (cle, params) =>
    traduire(langue, cle, params);

// Date locale (sans dépendre d'Intl : un format simple jj/mm/aaaa ou mm/dd selon la langue)
export function formaterDate(iso: string, langue: Langue): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return date.toLocaleDateString(BALISES[langue]);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export { messages };
