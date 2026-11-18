import type { DeepStrings } from "./types";

const fr = {
  title: "Mon profil",
  backToProjects: "Retour aux projets",
  infoTitle: "Informations",
  email: "Email",
  name: "Nom",
  updated: "Profil mis à jour.",
  passwordTitle: "Mot de passe",
  currentPassword: "Mot de passe actuel",
  newPassword: "Nouveau mot de passe",
  confirm: "Confirmation",
  changePassword: "Changer le mot de passe",
  changing: "Modification...",
  passwordChanged: "Mot de passe modifié.",
  avatarTitle: "Photo de profil",
  avatarHelp:
    "Prends une photo ou choisis une image : elle est réduite à 256 px avant l'envoi.",
  takePhoto: "Appareil photo",
  chooseFile: "Galerie",
  removePhoto: "Supprimer la photo",
  avatarAlt: "Photo de profil",
  avatarSaved: "Photo mise à jour.",
  avatarRemoved: "Photo supprimée.",
  avatarInvalid: "Image invalide (JPEG, PNG ou WebP).",
  avatarTooBig: "Image trop volumineuse.",
  avatarError: "Impossible de traiter cette image.",
  dataTitle: "Mes données",
  dataHelp:
    "Conformément au RGPD, tu peux récupérer toutes tes données ou supprimer ton compte.",
  exportData: "Télécharger mes données (JSON)",
  deleteTitle: "Supprimer mon compte",
  deleteHelp:
    "Ton nom et ton email sont effacés et tes projets dont tu es le seul membre sont supprimés. Dans les projets partagés, les décisions et l'historique restent, attribués à « Utilisateur supprimé ». Cette action est irréversible.",
  deletePassword: "Mot de passe pour confirmer",
  deleteButton: "Supprimer définitivement mon compte",
  deleteBlocked:
    "Impossible : tu es le dernier administrateur du projet « {project} », qui compte d'autres membres. Nomme un autre administrateur ou quitte le projet d'abord.",
};

const en: DeepStrings<typeof fr> = {
  title: "My profile",
  backToProjects: "Back to projects",
  infoTitle: "Information",
  email: "Email",
  name: "Name",
  updated: "Profile updated.",
  passwordTitle: "Password",
  currentPassword: "Current password",
  newPassword: "New password",
  confirm: "Confirmation",
  changePassword: "Change password",
  changing: "Updating...",
  passwordChanged: "Password changed.",
  avatarTitle: "Profile picture",
  avatarHelp:
    "Take a photo or pick an image: it is shrunk to 256 px before upload.",
  takePhoto: "Camera",
  chooseFile: "Gallery",
  removePhoto: "Remove photo",
  avatarAlt: "Profile picture",
  avatarSaved: "Photo updated.",
  avatarRemoved: "Photo removed.",
  avatarInvalid: "Invalid image (JPEG, PNG or WebP).",
  avatarTooBig: "Image too large.",
  avatarError: "This image could not be processed.",
  dataTitle: "My data",
  dataHelp:
    "Under the GDPR you can get a copy of all your data or delete your account.",
  exportData: "Download my data (JSON)",
  deleteTitle: "Delete my account",
  deleteHelp:
    "Your name and email are erased and projects where you are the only member are deleted. In shared projects, decisions and history remain, attributed to “Deleted user”. This cannot be undone.",
  deletePassword: "Password to confirm",
  deleteButton: "Permanently delete my account",
  deleteBlocked:
    "Not possible: you are the last administrator of the project “{project}”, which has other members. Appoint another administrator or leave the project first.",
};

const de: DeepStrings<typeof fr> = {
  title: "Mein Profil",
  backToProjects: "Zurück zu den Projekten",
  infoTitle: "Angaben",
  email: "E-Mail",
  name: "Name",
  updated: "Profil aktualisiert.",
  passwordTitle: "Passwort",
  currentPassword: "Aktuelles Passwort",
  newPassword: "Neues Passwort",
  confirm: "Bestätigung",
  changePassword: "Passwort ändern",
  changing: "Wird geändert...",
  passwordChanged: "Passwort geändert.",
  avatarTitle: "Profilbild",
  avatarHelp:
    "Mache ein Foto oder wähle ein Bild: Es wird vor dem Hochladen auf 256 px verkleinert.",
  takePhoto: "Kamera",
  chooseFile: "Galerie",
  removePhoto: "Foto entfernen",
  avatarAlt: "Profilbild",
  avatarSaved: "Foto aktualisiert.",
  avatarRemoved: "Foto entfernt.",
  avatarInvalid: "Ungültiges Bild (JPEG, PNG oder WebP).",
  avatarTooBig: "Bild zu groß.",
  avatarError: "Dieses Bild konnte nicht verarbeitet werden.",
  dataTitle: "Meine Daten",
  dataHelp:
    "Nach der DSGVO kannst du alle deine Daten abrufen oder dein Konto löschen.",
  exportData: "Meine Daten herunterladen (JSON)",
  deleteTitle: "Mein Konto löschen",
  deleteHelp:
    "Dein Name und deine E-Mail-Adresse werden gelöscht, Projekte, in denen du das einzige Mitglied bist, werden entfernt. In gemeinsamen Projekten bleiben Entscheidungen und Verlauf erhalten, zugeordnet zu „Gelöschter Benutzer“. Das kann nicht rückgängig gemacht werden.",
  deletePassword: "Passwort zur Bestätigung",
  deleteButton: "Mein Konto endgültig löschen",
  deleteBlocked:
    "Nicht möglich: Du bist der letzte Administrator des Projekts „{project}“, das weitere Mitglieder hat. Ernenne zuerst einen anderen Administrator oder verlasse das Projekt.",
};

export const profile = { fr, en, de };
