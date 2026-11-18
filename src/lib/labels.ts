import type { AdrStatusValue } from "@/lib/adr-status";
import type { TaskStatusValue } from "@/lib/task-status";
import type { MessageKey, Translator } from "@/i18n/translate";

// Les clés de traduction sont construites à partir de valeurs d'énumération
// (statuts, rôles) : on centralise ici le seul endroit où l'on caste.
export const adrStatusLabel = (t: Translator, status: AdrStatusValue) =>
  t(`adr.status.${status}` as MessageKey);

export const adrActionLabel = (t: Translator, status: AdrStatusValue) =>
  t(`adr.action.${status}` as MessageKey);

export const taskStatusLabel = (t: Translator, status: TaskStatusValue) =>
  t(`kanban.status.${status}` as MessageKey);

export const roleLabel = (t: Translator, role: "ADMIN" | "MEMBER") =>
  t(`roles.${role}` as MessageKey);

// Nom stocké quand un compte est anonymisé (droit à l'effacement) : il est
// remplacé à l'affichage par un libellé dans la langue de l'utilisateur.
export const DELETED_USER_NAME = "[deleted]";

export const displayName = (t: Translator, name: string) =>
  name === DELETED_USER_NAME ? t("common.unknownUser") : name;
