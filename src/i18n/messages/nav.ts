import type { DeepStrings } from "./types";

const fr = {
  mainLabel: "Navigation principale",
  projectLabel: "Navigation du projet",
  projects: "Mes projets",
  settings: "Paramètres",
  profile: "Mon profil",
  home: "Accueil",
  dashboard: "Tableau de bord",
  adr: "Décisions (ADR)",
  kanban: "Kanban",
  messages: "Messagerie",
  members: "Membres",
  history: "Historique",
  backToProjects: "← Mes projets",
};

const en: DeepStrings<typeof fr> = {
  mainLabel: "Main navigation",
  projectLabel: "Project navigation",
  projects: "My projects",
  settings: "Settings",
  profile: "My profile",
  home: "Home",
  dashboard: "Dashboard",
  adr: "Decisions (ADR)",
  kanban: "Kanban",
  messages: "Messages",
  members: "Members",
  history: "History",
  backToProjects: "← My projects",
};

const de: DeepStrings<typeof fr> = {
  mainLabel: "Hauptnavigation",
  projectLabel: "Projektnavigation",
  projects: "Meine Projekte",
  settings: "Einstellungen",
  profile: "Mein Profil",
  home: "Startseite",
  dashboard: "Dashboard",
  adr: "Entscheidungen (ADR)",
  kanban: "Kanban",
  messages: "Nachrichten",
  members: "Mitglieder",
  history: "Verlauf",
  backToProjects: "← Meine Projekte",
};

export const nav = { fr, en, de };
