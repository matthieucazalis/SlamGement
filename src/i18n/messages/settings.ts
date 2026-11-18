import type { DeepStrings } from "./types";

const fr = {
  title: "Paramètres",
  intro:
    "Ces préférences sont enregistrées sur ton compte et retrouvées sur tous tes appareils.",
  languageTitle: "Langue",
  languageHelp: "Langue de l'interface, des exports Markdown et des messages.",
  themeTitle: "Apparence",
  themeHelp:
    "Choisis un affichage clair ou sombre, ou suis le réglage de ton appareil.",
  themeLight: "Clair",
  themeDark: "Sombre",
  themeSystem: "Système",
  hapticsTitle: "Retour haptique",
  hapticsHelp:
    "Fait vibrer le téléphone lors des actions importantes (si l'appareil le permet).",
  hapticsOn: "Activé",
  hapticsOff: "Désactivé",
  saved: "Préférences enregistrées.",
  accountTitle: "Compte",
  accountHelp: "Photo, nom, mot de passe et données personnelles.",
  accountLink: "Gérer mon profil",
};

const en: DeepStrings<typeof fr> = {
  title: "Settings",
  intro:
    "These preferences are saved on your account and follow you on every device.",
  languageTitle: "Language",
  languageHelp: "Language of the interface, Markdown exports and messages.",
  themeTitle: "Appearance",
  themeHelp: "Pick a light or dark display, or follow your device setting.",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",
  hapticsTitle: "Haptic feedback",
  hapticsHelp:
    "Vibrates the phone on important actions (if the device supports it).",
  hapticsOn: "On",
  hapticsOff: "Off",
  saved: "Preferences saved.",
  accountTitle: "Account",
  accountHelp: "Photo, name, password and personal data.",
  accountLink: "Manage my profile",
};

const de: DeepStrings<typeof fr> = {
  title: "Einstellungen",
  intro:
    "Diese Einstellungen werden in deinem Konto gespeichert und gelten auf allen Geräten.",
  languageTitle: "Sprache",
  languageHelp:
    "Sprache der Oberfläche, der Markdown-Exporte und der Nachrichten.",
  themeTitle: "Darstellung",
  themeHelp:
    "Wähle eine helle oder dunkle Darstellung oder folge der Geräteeinstellung.",
  themeLight: "Hell",
  themeDark: "Dunkel",
  themeSystem: "System",
  hapticsTitle: "Haptisches Feedback",
  hapticsHelp:
    "Lässt das Telefon bei wichtigen Aktionen vibrieren (wenn das Gerät es unterstützt).",
  hapticsOn: "An",
  hapticsOff: "Aus",
  saved: "Einstellungen gespeichert.",
  accountTitle: "Konto",
  accountHelp: "Foto, Name, Passwort und persönliche Daten.",
  accountLink: "Mein Profil verwalten",
};

export const settings = { fr, en, de };
