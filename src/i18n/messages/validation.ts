import type { DeepStrings } from "./types";

// Ces clés sont utilisées comme messages d'erreur par les schémas Zod
// (voir lib/validators) puis traduites au moment d'afficher l'erreur.
const fr = {
  min2: "2 caractères minimum",
  min3: "3 caractères minimum",
  min8: "8 caractères minimum",
  max72: "72 caractères maximum",
  max500: "500 caractères maximum",
  max5000: "5000 caractères maximum",
  max10000: "10000 caractères maximum",
  email: "Email invalide",
  date: "Date invalide",
  passwordMismatch: "Les mots de passe ne correspondent pas",
  currentPasswordRequired: "Mot de passe actuel requis",
  contextMin: "Contexte : 10 caractères minimum",
  decisionMin: "Décision : 10 caractères minimum",
  consequencesMin: "Conséquences : 10 caractères minimum",
  forbiddenChars: "Caractères non autorisés (caractères de contrôle ou invisibles).",
  mermaidInvalid: "Ce n'est pas un schéma Mermaid valide (ex. « flowchart TD », « sequenceDiagram »).",
  messageEmpty: "Le message est vide.",
  messageMax: "2000 caractères maximum",
  invalid: "Données invalides.",
};

const en: DeepStrings<typeof fr> = {
  min2: "At least 2 characters",
  min3: "At least 3 characters",
  min8: "At least 8 characters",
  max72: "72 characters maximum",
  max500: "500 characters maximum",
  max5000: "5000 characters maximum",
  max10000: "10000 characters maximum",
  email: "Invalid email address",
  date: "Invalid date",
  passwordMismatch: "The passwords do not match",
  currentPasswordRequired: "Current password required",
  contextMin: "Context: at least 10 characters",
  decisionMin: "Decision: at least 10 characters",
  consequencesMin: "Consequences: at least 10 characters",
  forbiddenChars: "Characters not allowed (control or invisible characters).",
  mermaidInvalid: "This is not a valid Mermaid diagram (e.g. \"flowchart TD\", \"sequenceDiagram\").",
  messageEmpty: "The message is empty.",
  messageMax: "2000 characters maximum",
  invalid: "Invalid data.",
};

const de: DeepStrings<typeof fr> = {
  min2: "Mindestens 2 Zeichen",
  min3: "Mindestens 3 Zeichen",
  min8: "Mindestens 8 Zeichen",
  max72: "Höchstens 72 Zeichen",
  max500: "Höchstens 500 Zeichen",
  max5000: "Höchstens 5000 Zeichen",
  max10000: "Höchstens 10000 Zeichen",
  email: "Ungültige E-Mail-Adresse",
  date: "Ungültiges Datum",
  passwordMismatch: "Die Passwörter stimmen nicht überein",
  currentPasswordRequired: "Aktuelles Passwort erforderlich",
  contextMin: "Kontext: mindestens 10 Zeichen",
  decisionMin: "Entscheidung: mindestens 10 Zeichen",
  consequencesMin: "Konsequenzen: mindestens 10 Zeichen",
  forbiddenChars: "Nicht erlaubte Zeichen (Steuer- oder unsichtbare Zeichen).",
  mermaidInvalid: "Das ist kein gültiges Mermaid-Diagramm (z. B. \"flowchart TD\", \"sequenceDiagram\").",
  messageEmpty: "Die Nachricht ist leer.",
  messageMax: "Höchstens 2000 Zeichen",
  invalid: "Ungültige Daten.",
};

export const validation = { fr, en, de };
