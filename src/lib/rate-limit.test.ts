import { describe, expect, it } from "vitest";
import {
  WINDOW_MS,
  isLimitReached,
  isWindowExpired,
  normalizeIp,
} from "./rate-limit";

describe("fenêtre de limitation", () => {
  const start = new Date("2026-10-20T10:00:00Z");

  it("est active juste avant la fin de la fenêtre", () => {
    const now = new Date(start.getTime() + WINDOW_MS - 1);
    expect(isWindowExpired(start, now)).toBe(false);
  });

  it("est expirée une fois la fenêtre écoulée", () => {
    const now = new Date(start.getTime() + WINDOW_MS);
    expect(isWindowExpired(start, now)).toBe(true);
  });
});

describe("seuil", () => {
  it("est atteint à la valeur maximale", () => {
    expect(isLimitReached(4, 5)).toBe(false);
    expect(isLimitReached(5, 5)).toBe(true);
    expect(isLimitReached(6, 5)).toBe(true);
  });
});

describe("normalizeIp", () => {
  it("garde la première adresse de la liste", () => {
    expect(normalizeIp("203.0.113.5, 10.0.0.1")).toBe("203.0.113.5");
  });

  it("accepte une adresse IPv6", () => {
    expect(normalizeIp("2001:db8::1")).toBe("2001:db8::1");
  });

  it("renvoie null si l'en-tête est absent, vide ou invalide", () => {
    expect(normalizeIp(null)).toBeNull();
    expect(normalizeIp("")).toBeNull();
    expect(normalizeIp("n'importe quoi")).toBeNull();
    expect(normalizeIp("a".repeat(100))).toBeNull();
  });
});
