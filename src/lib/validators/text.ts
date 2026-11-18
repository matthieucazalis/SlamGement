import { z } from "zod";

// Caractères de contrôle (dont le NUL, que PostgreSQL refuse et qui provoquait
// une erreur serveur) : tout sauf tabulation, saut de ligne et retour chariot.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
// Caractères invisibles de direction/formatage qui servent à tromper l'œil
const BIDI_CHARS = /[\u202A-\u202E\u2066-\u2069\u200B-\u200F\uFEFF]/;

export function hasForbiddenChars(value: string): boolean {
  return CONTROL_CHARS.test(value) || BIDI_CHARS.test(value);
}

// Texte sans caractères interdits (le message est une clé de traduction)
export const safeString = () =>
  z.string().refine((v) => !hasForbiddenChars(v), "validation.forbiddenChars");
