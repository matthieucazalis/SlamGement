import type { DeepStrings } from "./types";

const fr = {
  title: "Invitation SlamGement",
  invalidLink: "Ce lien d'invitation est invalide ou a expiré.",
  introBefore: "Tu es invité(e) à rejoindre le projet",
  introMiddle: "avec le rôle",
  errorEmail:
    "Cette invitation est destinée à {email}. Connecte-toi avec ce compte.",
  errorInvalid: "Cette invitation n'est plus valable.",
  join: "Rejoindre le projet",
  loginBefore: "Connecte-toi ou crée un compte avec l'adresse",
  loginAfter: ": tu reviendras ensuite sur cette invitation.",
  login: "Connexion",
  register: "Inscription",
};

const en: DeepStrings<typeof fr> = {
  title: "SlamGement invitation",
  invalidLink: "This invitation link is invalid or has expired.",
  introBefore: "You are invited to join the project",
  introMiddle: "with the role",
  errorEmail:
    "This invitation is meant for {email}. Sign in with that account.",
  errorInvalid: "This invitation is no longer valid.",
  join: "Join the project",
  loginBefore: "Sign in or create an account with the address",
  loginAfter: ": you will then come back to this invitation.",
  login: "Sign in",
  register: "Sign up",
};

const de: DeepStrings<typeof fr> = {
  title: "SlamGement-Einladung",
  invalidLink: "Dieser Einladungslink ist ungültig oder abgelaufen.",
  introBefore: "Du bist eingeladen, dem Projekt",
  introMiddle: "beizutreten, mit der Rolle",
  errorEmail:
    "Diese Einladung ist für {email} bestimmt. Melde dich mit diesem Konto an.",
  errorInvalid: "Diese Einladung ist nicht mehr gültig.",
  join: "Dem Projekt beitreten",
  loginBefore: "Melde dich an oder erstelle ein Konto mit der Adresse",
  loginAfter: ": Du kehrst danach zu dieser Einladung zurück.",
  login: "Anmelden",
  register: "Registrieren",
};

export const invite = { fr, en, de };
