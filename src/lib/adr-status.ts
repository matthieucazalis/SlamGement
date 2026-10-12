export const ADR_STATUSES = [
  "PROPOSED",
  "ACCEPTED",
  "REJECTED",
  "DEPRECATED",
  "SUPERSEDED",
] as const;

export type AdrStatusValue = (typeof ADR_STATUSES)[number];

const TRANSITIONS: Record<AdrStatusValue, readonly AdrStatusValue[]> = {
  PROPOSED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["DEPRECATED", "SUPERSEDED"],
  REJECTED: ["PROPOSED"],
  DEPRECATED: [],
  SUPERSEDED: [],
};

export const STATUS_LABELS: Record<AdrStatusValue, string> = {
  PROPOSED: "Proposé",
  ACCEPTED: "Accepté",
  REJECTED: "Rejeté",
  DEPRECATED: "Déprécié",
  SUPERSEDED: "Remplacé",
};

export function allowedTransitions(from: AdrStatusValue) {
  return TRANSITIONS[from];
}

export function canTransition(from: AdrStatusValue, to: AdrStatusValue) {
  return TRANSITIONS[from].includes(to);
}

export function isFinalStatus(status: AdrStatusValue) {
  return TRANSITIONS[status].length === 0;
}

export function isContentEditable(status: AdrStatusValue) {
  return status === "PROPOSED";
}
