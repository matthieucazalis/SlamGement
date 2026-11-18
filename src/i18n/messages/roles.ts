import type { DeepStrings } from "./types";

const fr = {
  ADMIN: "Administrateur",
  MEMBER: "Membre",
  adminLower: "administrateur",
  memberLower: "membre",
};

const en: DeepStrings<typeof fr> = {
  ADMIN: "Administrator",
  MEMBER: "Member",
  adminLower: "administrator",
  memberLower: "member",
};

const de: DeepStrings<typeof fr> = {
  ADMIN: "Administrator",
  MEMBER: "Mitglied",
  adminLower: "Administrator",
  memberLower: "Mitglied",
};

export const roles = { fr, en, de };
