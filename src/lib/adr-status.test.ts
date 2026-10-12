import { describe, expect, it } from "vitest";
import {
  ADR_STATUSES,
  allowedTransitions,
  canTransition,
  isContentEditable,
  isFinalStatus,
  type AdrStatusValue,
} from "./adr-status";

const AUTHORIZED: [AdrStatusValue, AdrStatusValue][] = [
  ["PROPOSED", "ACCEPTED"],
  ["PROPOSED", "REJECTED"],
  ["ACCEPTED", "DEPRECATED"],
  ["ACCEPTED", "SUPERSEDED"],
  ["REJECTED", "PROPOSED"],
];

describe("transitions de statut d'un ADR", () => {
  it.each(AUTHORIZED)("autorise %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it("interdit REJECTED → ACCEPTED sans repasser par PROPOSED", () => {
    expect(canTransition("REJECTED", "ACCEPTED")).toBe(false);
  });

  it("interdit PROPOSED → DEPRECATED", () => {
    expect(canTransition("PROPOSED", "DEPRECATED")).toBe(false);
  });

  it("interdit de « changer » vers le même statut", () => {
    for (const s of ADR_STATUSES) expect(canTransition(s, s)).toBe(false);
  });

  it("refuse toute combinaison qui n'est pas explicitement autorisée", () => {
    for (const from of ADR_STATUSES) {
      for (const to of ADR_STATUSES) {
        const expected = AUTHORIZED.some(([f, t]) => f === from && t === to);
        expect(canTransition(from, to)).toBe(expected);
      }
    }
  });

  it("DEPRECATED et SUPERSEDED sont des états finaux", () => {
    expect(isFinalStatus("DEPRECATED")).toBe(true);
    expect(isFinalStatus("SUPERSEDED")).toBe(true);
    expect(allowedTransitions("DEPRECATED")).toHaveLength(0);
  });

  it("PROPOSED, ACCEPTED et REJECTED ne sont pas finaux", () => {
    for (const s of ["PROPOSED", "ACCEPTED", "REJECTED"] as const)
      expect(isFinalStatus(s)).toBe(false);
  });

  it("le contenu n'est modifiable qu'en PROPOSED", () => {
    expect(isContentEditable("PROPOSED")).toBe(true);
    expect(isContentEditable("ACCEPTED")).toBe(false);
    expect(isContentEditable("REJECTED")).toBe(false);
  });
});
