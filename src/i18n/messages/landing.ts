import type { DeepStrings } from "./types";

const fr = {
  tagline: "Gère ton projet d'équipe au même endroit",
  intro:
    "SlamGement réunit tes décisions d'architecture, ton tableau Kanban, ta messagerie et tes membres dans un espace simple et sécurisé.",
  ctaLogin: "Se connecter",
  ctaRegister: "Créer un compte",
  ctaOpen: "Accéder à mes projets",
  featuresTitle: "Tout ce qu'il faut pour avancer ensemble",
  adrTitle: "Décisions (ADR)",
  adrText:
    "Garde la trace de chaque choix technique : contexte, décision, conséquences, avec schémas Mermaid.",
  kanbanTitle: "Kanban",
  kanbanText:
    "Organise les tâches en colonnes, assigne-les et relie-les à tes décisions.",
  chatTitle: "Messagerie",
  chatText:
    "Discute avec ton équipe directement dans le projet, en texte simple et sécurisé.",
  teamTitle: "Équipe et droits",
  teamText:
    "Invite des membres par lien, gère les rôles et consulte l'historique des actions.",
  finalTitle: "Prêt à t'y mettre ?",
  finalText: "Crée un compte gratuitement pour utiliser tous les outils.",
  privacy: "Confidentialité",
  notice: "Mentions légales",
};

const en: DeepStrings<typeof fr> = {
  tagline: "Run your team project in one place",
  intro:
    "SlamGement brings your architecture decisions, Kanban board, messaging and members together in a simple, secure space.",
  ctaLogin: "Log in",
  ctaRegister: "Create an account",
  ctaOpen: "Go to my projects",
  featuresTitle: "Everything you need to move forward together",
  adrTitle: "Decisions (ADR)",
  adrText:
    "Keep track of every technical choice: context, decision, consequences, with Mermaid diagrams.",
  kanbanTitle: "Kanban",
  kanbanText:
    "Organize tasks in columns, assign them and link them to your decisions.",
  chatTitle: "Messages",
  chatText:
    "Talk with your team right inside the project, in plain, secure text.",
  teamTitle: "Team and permissions",
  teamText:
    "Invite members with a link, manage roles and review the action history.",
  finalTitle: "Ready to get started?",
  finalText: "Create a free account to use all the tools.",
  privacy: "Privacy",
  notice: "Legal notice",
};

const de: DeepStrings<typeof fr> = {
  tagline: "Verwalte dein Teamprojekt an einem Ort",
  intro:
    "SlamGement vereint Architekturentscheidungen, Kanban-Board, Nachrichten und Mitglieder in einem einfachen, sicheren Bereich.",
  ctaLogin: "Anmelden",
  ctaRegister: "Konto erstellen",
  ctaOpen: "Zu meinen Projekten",
  featuresTitle: "Alles, was ihr gemeinsam braucht",
  adrTitle: "Entscheidungen (ADR)",
  adrText:
    "Halte jede technische Entscheidung fest: Kontext, Entscheidung, Konsequenzen, mit Mermaid-Diagrammen.",
  kanbanTitle: "Kanban",
  kanbanText:
    "Organisiere Aufgaben in Spalten, weise sie zu und verknüpfe sie mit deinen Entscheidungen.",
  chatTitle: "Nachrichten",
  chatText:
    "Sprich mit deinem Team direkt im Projekt, in einfachem, sicherem Text.",
  teamTitle: "Team und Rechte",
  teamText:
    "Lade Mitglieder per Link ein, verwalte Rollen und sieh den Verlauf ein.",
  finalTitle: "Bereit loszulegen?",
  finalText: "Erstelle kostenlos ein Konto, um alle Werkzeuge zu nutzen.",
  privacy: "Datenschutz",
  notice: "Impressum",
};

export const landing = { fr, en, de };
