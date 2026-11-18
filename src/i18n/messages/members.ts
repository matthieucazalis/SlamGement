import type { DeepStrings } from "./types";

const fr = {
  title: "Membres",
  you: "(toi)",
  roleOf: "Rôle de {name}",
  apply: "Appliquer",
  leave: "Quitter",
  remove: "Retirer",
  inviteTitle: "Inviter un collaborateur",
  email: "Email",
  role: "Rôle",
  createLink: "Créer le lien d'invitation",
  creating: "Création...",
  linkInfo:
    "Transmets ce lien à la personne invitée (valable 7 jours, il ne sera plus affichable ensuite) :",
  errorLastAdmin:
    "Impossible : le projet doit garder au moins un administrateur.",
  errorForbidden: "Action non autorisée.",
  errorInvalid: "Données invalides.",
};

const en: DeepStrings<typeof fr> = {
  title: "Members",
  you: "(you)",
  roleOf: "Role of {name}",
  apply: "Apply",
  leave: "Leave",
  remove: "Remove",
  inviteTitle: "Invite a collaborator",
  email: "Email",
  role: "Role",
  createLink: "Create invitation link",
  creating: "Creating...",
  linkInfo:
    "Send this link to the invited person (valid for 7 days, it cannot be displayed again):",
  errorLastAdmin:
    "Not possible: the project must keep at least one administrator.",
  errorForbidden: "Action not allowed.",
  errorInvalid: "Invalid data.",
};

const de: DeepStrings<typeof fr> = {
  title: "Mitglieder",
  you: "(du)",
  roleOf: "Rolle von {name}",
  apply: "Übernehmen",
  leave: "Verlassen",
  remove: "Entfernen",
  inviteTitle: "Mitarbeiter einladen",
  email: "E-Mail",
  role: "Rolle",
  createLink: "Einladungslink erstellen",
  creating: "Wird erstellt...",
  linkInfo:
    "Sende diesen Link an die eingeladene Person (7 Tage gültig, er kann danach nicht mehr angezeigt werden):",
  errorLastAdmin:
    "Nicht möglich: Das Projekt muss mindestens einen Administrator behalten.",
  errorForbidden: "Aktion nicht erlaubt.",
  errorInvalid: "Ungültige Daten.",
};

export const members = { fr, en, de };
