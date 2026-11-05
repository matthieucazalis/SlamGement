import { describe, expect, it } from "vitest";
import { formatDateTime, startOfDayInAppZone } from "./format";

describe("startOfDayInAppZone", () => {
  it("donne minuit heure de Paris en hiver (UTC+1)", () => {
    expect(startOfDayInAppZone("2026-01-15")?.toISOString()).toBe(
      "2026-01-14T23:00:00.000Z",
    );
  });

  it("donne minuit heure de Paris en été (UTC+2)", () => {
    expect(startOfDayInAppZone("2026-07-15")?.toISOString()).toBe(
      "2026-07-14T22:00:00.000Z",
    );
  });

  it("gère le changement d'heure (passage à l'heure d'été le 29/03/2026)", () => {
    expect(startOfDayInAppZone("2026-03-29")?.toISOString()).toBe(
      "2026-03-28T23:00:00.000Z",
    );
    expect(startOfDayInAppZone("2026-03-30")?.toISOString()).toBe(
      "2026-03-29T22:00:00.000Z",
    );
  });

  it("décale d'un jour pour borner une date de fin incluse", () => {
    expect(startOfDayInAppZone("2026-01-15", 1)?.toISOString()).toBe(
      "2026-01-15T23:00:00.000Z",
    );
  });

  it("refuse les dates absentes ou invalides", () => {
    expect(startOfDayInAppZone(undefined)).toBeUndefined();
    expect(startOfDayInAppZone("pas-une-date")).toBeUndefined();
    expect(startOfDayInAppZone("2026-02-31")).toBeUndefined();
  });
});

describe("formatDateTime", () => {
  it("affiche l'heure de Paris, quel que soit le fuseau du serveur", () => {
    expect(formatDateTime(new Date("2026-01-15T10:30:00Z"))).toBe(
      "15/01/2026 11:30:00",
    );
  });
});
