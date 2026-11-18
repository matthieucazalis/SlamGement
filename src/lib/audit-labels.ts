import { formatAdrNumber } from "@/lib/adr-format";
import type { AdrStatusValue } from "@/lib/adr-status";
import { adrStatusLabel, taskStatusLabel } from "@/lib/labels";
import type { TaskStatusValue } from "@/lib/task-status";
import type { MessageKey, Translator } from "@/i18n/translate";

export const AUDIT_ACTIONS_LIST = [
  "PROJECT_CREATED",
  "PROJECT_DELETED",
  "MEMBER_INVITED",
  "MEMBER_JOINED",
  "MEMBER_ROLE_CHANGED",
  "MEMBER_REMOVED",
  "ADR_CREATED",
  "ADR_UPDATED",
  "ADR_STATUS_CHANGED",
  "ADR_DELETED",
  "TASK_CREATED",
  "TASK_UPDATED",
  "TASK_MOVED",
  "TASK_DELETED",
] as const;

export function auditActionLabel(t: Translator, action: string) {
  return (AUDIT_ACTIONS_LIST as readonly string[]).includes(action)
    ? t(`audit.action.${action}` as MessageKey)
    : action;
}

const FIELDS = [
  "title",
  "context",
  "decision",
  "consequences",
  "alternatives",
  "mermaidCode",
];

type Meta = Record<string, unknown>;

const asMeta = (m: unknown): Meta =>
  m && typeof m === "object" && !Array.isArray(m) ? (m as Meta) : {};
const str = (v: unknown) => (typeof v === "string" ? v : undefined);

// Les métadonnées sont du JSON libre : on ne suppose jamais leur forme.
export function describeAudit(
  t: Translator,
  action: string,
  metadata: unknown,
): string {
  const m = asMeta(metadata);

  const adrRef = (n: unknown) =>
    typeof n === "number" ? `ADR-${formatAdrNumber(n)}` : t("audit.anAdr");
  // « Titre » entre guillemets propres à la langue, précédé d'une espace
  const quoted = (v: unknown) =>
    str(v) ? ` ${t("audit.quoteOpen")}${str(v)}${t("audit.quoteClose")}` : "";
  const statusOf = (v: unknown) =>
    typeof v === "string" ? adrStatusLabel(t, v as AdrStatusValue) : String(v);
  const taskStatusOf = (v: unknown) =>
    typeof v === "string"
      ? taskStatusLabel(t, v as TaskStatusValue)
      : String(v);
  const role = (v: unknown) =>
    v === "ADMIN"
      ? t("roles.adminLower")
      : v === "MEMBER"
        ? t("roles.memberLower")
        : t("audit.unknownRole");

  switch (action) {
    case "PROJECT_CREATED":
      return t("audit.detail.projectCreated", { name: quoted(m.name) });
    case "PROJECT_DELETED":
      return t("audit.detail.projectDeleted", { name: quoted(m.name) });
    case "MEMBER_INVITED":
      return t("audit.detail.memberInvited", {
        who: str(m.email) ?? t("audit.someone"),
        role: role(m.role),
      });
    case "MEMBER_JOINED":
      return t("audit.detail.memberJoined", { role: role(m.role) });
    case "MEMBER_ROLE_CHANGED":
      return t("audit.detail.roleChanged", {
        from: role(m.from),
        to: role(m.to),
      });
    case "MEMBER_REMOVED":
      return m.left === true
        ? t("audit.detail.memberLeft")
        : t("audit.detail.memberRemoved");
    case "ADR_CREATED":
      return t("audit.detail.adrCreated", {
        adr: adrRef(m.number),
        title: quoted(m.title),
      });
    case "ADR_UPDATED": {
      const fields = Array.isArray(m.fields)
        ? m.fields
            .map((f) =>
              FIELDS.includes(String(f))
                ? t(`audit.field.${String(f)}` as MessageKey)
                : String(f),
            )
            .join(", ")
        : "";
      return fields
        ? t("audit.detail.adrUpdatedFields", { adr: adrRef(m.number), fields })
        : t("audit.detail.adrUpdated", { adr: adrRef(m.number) });
    }
    case "ADR_STATUS_CHANGED": {
      if (m.from && m.to) {
        const params = {
          adr: adrRef(m.number),
          from: statusOf(m.from),
          to: statusOf(m.to),
        };
        return typeof m.supersededBy === "number"
          ? t("audit.detail.adrStatusBy", {
              ...params,
              by: `ADR-${formatAdrNumber(m.supersededBy)}`,
            })
          : t("audit.detail.adrStatus", params);
      }
      return t("audit.detail.adrStatusGeneric", { adr: adrRef(m.number) });
    }
    case "ADR_DELETED":
      return t("audit.detail.adrDeleted", {
        adr: adrRef(m.number),
        title: quoted(m.title),
      });
    case "TASK_CREATED":
      return t("audit.detail.taskCreated", { title: quoted(m.title) });
    case "TASK_UPDATED":
      return t("audit.detail.taskUpdated", { title: quoted(m.title) });
    case "TASK_MOVED":
      return t("audit.detail.taskMoved", {
        title: quoted(m.title),
        from: taskStatusOf(m.from),
        to: taskStatusOf(m.to),
      });
    case "TASK_DELETED":
      return t("audit.detail.taskDeleted", { title: quoted(m.title) });
    default:
      return action;
  }
}
