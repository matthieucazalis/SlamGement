import type { DeepStrings } from "./types";

const fr = {
  resetSubject: "SlamGement : réinitialisation de ton mot de passe",
  resetBody:
    "Bonjour {name},\n\nTu as demandé à réinitialiser ton mot de passe SlamGement. Clique sur ce lien (valable {minutes} minutes, utilisable une seule fois) :\n\n{link}\n\nSi tu n'es pas à l'origine de cette demande, ignore simplement ce message : ton mot de passe reste inchangé.",
};

const en: DeepStrings<typeof fr> = {
  resetSubject: "SlamGement: reset your password",
  resetBody:
    "Hello {name},\n\nYou asked to reset your SlamGement password. Click this link (valid for {minutes} minutes, single use):\n\n{link}\n\nIf you did not make this request, just ignore this message: your password stays unchanged.",
};

const de: DeepStrings<typeof fr> = {
  resetSubject: "SlamGement: Passwort zurücksetzen",
  resetBody:
    "Hallo {name},\n\ndu hast darum gebeten, dein SlamGement-Passwort zurückzusetzen. Klicke auf diesen Link (gültig für {minutes} Minuten, nur einmal verwendbar):\n\n{link}\n\nWenn du diese Anfrage nicht gestellt hast, ignoriere diese Nachricht einfach: Dein Passwort bleibt unverändert.",
};

export const email = { fr, en, de };
