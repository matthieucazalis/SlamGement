import type { StatutAdr, StatutTache } from "./types";
import { STATUTS_TACHE } from "./types";

// Ces règles reproduisent celles du site (src/lib/adr-status.ts et task-status.ts)
// pour n'afficher que les boutons utiles. Le SERVEUR reste l'arbitre : une
// transition refusée renvoie 409, que l'application affiche proprement.
const TRANSITIONS: Record<StatutAdr, readonly StatutAdr[]> = {
  PROPOSED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["DEPRECATED", "SUPERSEDED"],
  REJECTED: ["PROPOSED"],
  DEPRECATED: [],
  SUPERSEDED: [],
};

export const transitionsPossibles = (depuis: StatutAdr) => TRANSITIONS[depuis];

export function statutPrecedent(statut: StatutTache): StatutTache | null {
  const i = STATUTS_TACHE.indexOf(statut);
  return i > 0 ? STATUTS_TACHE[i - 1] : null;
}

export function statutSuivant(statut: StatutTache): StatutTache | null {
  const i = STATUTS_TACHE.indexOf(statut);
  return i < STATUTS_TACHE.length - 1 ? STATUTS_TACHE[i + 1] : null;
}

// Une échéance est une date (minuit UTC). En retard = passée et tâche non terminée.
export function estEnRetard(
  echeance: string | null,
  statut: StatutTache,
  maintenant = new Date(),
) {
  if (!echeance || statut === "DONE") return false;
  const dateEcheance = new Date(echeance);
  const debutAujourdhui = Date.UTC(
    maintenant.getUTCFullYear(),
    maintenant.getUTCMonth(),
    maintenant.getUTCDate(),
  );
  return dateEcheance.getTime() < debutAujourdhui;
}

// Même règle que le site : « 0001 », « 0042 »
export const formaterNumeroAdr = (numero: number) =>
  String(numero).padStart(4, "0");

// Les paramètres d'URL sont toujours du texte (cours : useLocalSearchParams)
export function lireNumero(
  texte: string | string[] | undefined,
): number | null {
  const brut = Array.isArray(texte) ? texte[0] : texte;
  const n = Number(brut);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Mêmes minimums que le site (src/lib/validators/adr.ts)
export function validerNouvelAdr(v: {
  title: string;
  context: string;
  decision: string;
  consequences: string;
}) {
  const manquants: ("title" | "context" | "decision" | "consequences")[] = [];
  if (v.title.trim().length < 3) manquants.push("title");
  if (v.context.trim().length < 10) manquants.push("context");
  if (v.decision.trim().length < 10) manquants.push("decision");
  if (v.consequences.trim().length < 10) manquants.push("consequences");
  return manquants;
}
