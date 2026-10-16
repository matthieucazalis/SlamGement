import { formatAdrNumber } from "@/lib/adr-format";
import { STATUS_LABELS, type AdrStatusValue } from "@/lib/adr-status";
import { TASK_STATUS_LABELS, type TaskStatusValue } from "@/lib/task-status";

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  PROJECT_CREATED: "Projet créé",
  PROJECT_DELETED: "Projet supprimé",
  MEMBER_INVITED: "Invitation créée",
  MEMBER_JOINED: "Membre arrivé",
  MEMBER_ROLE_CHANGED: "Rôle modifié",
  MEMBER_REMOVED: "Membre retiré",
  ADR_CREATED: "ADR créé",
  ADR_UPDATED: "ADR modifié",
  ADR_STATUS_CHANGED: "Statut d'ADR modifié",
  ADR_DELETED: "ADR supprimé",
  TASK_CREATED: "Tâche créée",
  TASK_UPDATED: "Tâche modifiée",
  TASK_MOVED: "Tâche déplacée",
  TASK_DELETED: "Tâche supprimée",
};

const FIELD_LABELS: Record<string, string> = {
  title: "titre",
  context: "contexte",
  decision: "décision",
  consequences: "conséquences",
  alternatives: "alternatives",
  mermaidCode: "schéma",
};

type Meta = Record<string, unknown>;

const asMeta = (m: unknown): Meta =>
  m && typeof m === "object" && !Array.isArray(m) ? (m as Meta) : {};
const str = (v: unknown) => (typeof v === "string" ? v : undefined);
const adrRef = (m: Meta) =>
  typeof m.number === "number" ? `ADR-${formatAdrNumber(m.number)}` : "un ADR";
const quoted = (v: unknown) => (str(v) ? ` « ${str(v)} »` : "");
const statusLabel = (v: unknown) =>
  STATUS_LABELS[v as AdrStatusValue] ?? String(v);
const taskStatusLabel = (v: unknown) =>
  TASK_STATUS_LABELS[v as TaskStatusValue] ?? String(v);
const roleLabel = (v: unknown) =>
  v === "ADMIN" ? "administrateur" : v === "MEMBER" ? "membre" : "?";

// Les métadonnées sont du JSON libre : on ne suppose jamais leur forme.
export function describeAudit(action: string, metadata: unknown): string {
  const m = asMeta(metadata);

  switch (action) {
    case "PROJECT_CREATED":
      return `a créé le projet${quoted(m.name)}`;
    case "PROJECT_DELETED":
      return `a supprimé le projet${quoted(m.name)}`;
    case "MEMBER_INVITED":
      return `a invité ${str(m.email) ?? "quelqu'un"} (${roleLabel(m.role)})`;
    case "MEMBER_JOINED":
      return `a rejoint le projet (${roleLabel(m.role)})`;
    case "MEMBER_ROLE_CHANGED":
      return `a changé le rôle d'un membre : ${roleLabel(m.from)} → ${roleLabel(m.to)}`;
    case "MEMBER_REMOVED":
      return m.left === true ? "a quitté le projet" : "a retiré un membre";
    case "ADR_CREATED":
      return `a créé ${adrRef(m)}${quoted(m.title)}`;
    case "ADR_UPDATED": {
      const fields = Array.isArray(m.fields)
        ? m.fields.map((f) => FIELD_LABELS[String(f)] ?? String(f)).join(", ")
        : "";
      return `a modifié ${adrRef(m)}${fields ? ` (${fields})` : ""}`;
    }
    case "ADR_STATUS_CHANGED": {
      const by =
        typeof m.supersededBy === "number"
          ? ` (remplacé par ADR-${formatAdrNumber(m.supersededBy)})`
          : "";
      if (m.from && m.to)
        return `a fait passer ${adrRef(m)} de ${statusLabel(m.from)} à ${statusLabel(m.to)}${by}`;
      return `a changé le statut de ${adrRef(m)}`;
    }
    case "ADR_DELETED":
      return `a supprimé ${adrRef(m)}${quoted(m.title)}`;
    case "TASK_CREATED":
      return `a créé la tâche${quoted(m.title)}`;
    case "TASK_UPDATED":
      return `a modifié la tâche${quoted(m.title)}`;
    case "TASK_MOVED":
      return `a déplacé la tâche${quoted(m.title)} de ${taskStatusLabel(m.from)} à ${taskStatusLabel(m.to)}`;
    case "TASK_DELETED":
      return `a supprimé la tâche${quoted(m.title)}`;
    default:
      return action;
  }
}
