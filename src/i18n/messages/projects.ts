import type { DeepStrings } from "./types";

const fr = {
  title: "Mes projets",
  empty: "Aucun projet pour l'instant. Crée le premier ci-dessous.",
  newTitle: "Nouveau projet",
  name: "Nom",
  descriptionOptional: "Description (facultatif)",
  create: "Créer le projet",
  creating: "Création...",
  yourRole: "Ton rôle : {role}",
  dangerTitle: "Zone dangereuse",
  dangerText:
    "Supprimer le projet efface définitivement ses membres, ses invitations et ses décisions. Cette action est irréversible.",
  confirmBefore: "Tape",
  confirmAfter: "pour confirmer",
  deleteForever: "Supprimer définitivement",
  errorConfirm:
    "Le nom saisi ne correspond pas : le projet n'a pas été supprimé.",
  errorForbidden: "Action réservée aux administrateurs.",
  backTo: "← Mes projets",
};

const en: DeepStrings<typeof fr> = {
  title: "My projects",
  empty: "No project yet. Create the first one below.",
  newTitle: "New project",
  name: "Name",
  descriptionOptional: "Description (optional)",
  create: "Create project",
  creating: "Creating...",
  yourRole: "Your role: {role}",
  dangerTitle: "Danger zone",
  dangerText:
    "Deleting the project permanently erases its members, invitations and decisions. This cannot be undone.",
  confirmBefore: "Type",
  confirmAfter: "to confirm",
  deleteForever: "Delete permanently",
  errorConfirm:
    "The name you typed does not match: the project was not deleted.",
  errorForbidden: "This action is reserved for administrators.",
  backTo: "← My projects",
};

const de: DeepStrings<typeof fr> = {
  title: "Meine Projekte",
  empty: "Noch kein Projekt. Erstelle unten das erste.",
  newTitle: "Neues Projekt",
  name: "Name",
  descriptionOptional: "Beschreibung (optional)",
  create: "Projekt erstellen",
  creating: "Wird erstellt...",
  yourRole: "Deine Rolle: {role}",
  dangerTitle: "Gefahrenzone",
  dangerText:
    "Beim Löschen des Projekts werden Mitglieder, Einladungen und Entscheidungen endgültig entfernt. Das kann nicht rückgängig gemacht werden.",
  confirmBefore: "Gib",
  confirmAfter: "zur Bestätigung ein",
  deleteForever: "Endgültig löschen",
  errorConfirm:
    "Der eingegebene Name stimmt nicht überein: Das Projekt wurde nicht gelöscht.",
  errorForbidden: "Diese Aktion ist Administratoren vorbehalten.",
  backTo: "← Meine Projekte",
};

export const projects = { fr, en, de };
