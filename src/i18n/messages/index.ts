import type { Locale } from "../config";
import { adr } from "./adr";
import { audit } from "./audit";
import { chat } from "./chat";
import { auth } from "./auth";
import { common } from "./common";
import { dashboard } from "./dashboard";
import { email } from "./email";
import { errors } from "./errors";
import { history } from "./history";
import { invite } from "./invite";
import { kanban } from "./kanban";
import { landing } from "./landing";
import { legal } from "./legal";
import { members } from "./members";
import { nav } from "./nav";
import { profile } from "./profile";
import { projects } from "./projects";
import { roles } from "./roles";
import { settings } from "./settings";
import { validation } from "./validation";

// Un domaine = un fichier contenant les trois langues côte à côte.
const domains = {
  common,
  validation,
  errors,
  email,
  auth,
  nav,
  settings,
  roles,
  profile,
  projects,
  members,
  invite,
  adr,
  kanban,
  chat,
  landing,
  dashboard,
  history,
  audit,
  legal,
};

type Domains = typeof domains;

// La forme de référence est celle du français.
export type Messages = { [D in keyof Domains]: Domains[D]["fr"] };

function pick(locale: Locale): Messages {
  return Object.fromEntries(
    Object.entries(domains).map(([name, langs]) => [name, langs[locale]]),
  ) as Messages;
}

export const messages: Record<Locale, Messages> = {
  fr: pick("fr"),
  en: pick("en"),
  de: pick("de"),
};
