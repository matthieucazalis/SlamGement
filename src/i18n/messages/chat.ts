import type { DeepStrings } from "./types";

const fr = {
  title: "Messagerie",
  empty: "Aucun message pour l'instant. Lance la discussion !",
  placeholder: "Écris un message (Entrée pour envoyer, Maj+Entrée pour un saut de ligne)",
  send: "Envoyer",
  limitNote:
    "Maximum 50 messages : les nouveaux messages remplacent les plus anciens.",
};

const en: DeepStrings<typeof fr> = {
  title: "Messages",
  empty: "No messages yet. Start the conversation!",
  placeholder: "Write a message (Enter to send, Shift+Enter for a new line)",
  send: "Send",
  limitNote: "Maximum 50 messages: new messages replace the oldest ones.",
};

const de: DeepStrings<typeof fr> = {
  title: "Nachrichten",
  empty: "Noch keine Nachrichten. Starte die Unterhaltung!",
  placeholder: "Nachricht schreiben (Enter zum Senden, Umschalt+Enter für Zeilenumbruch)",
  send: "Senden",
  limitNote:
    "Höchstens 50 Nachrichten: neue Nachrichten ersetzen die ältesten.",
};

export const chat = { fr, en, de };
