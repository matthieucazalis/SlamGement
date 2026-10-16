import { describe, expect, it } from "vitest";
import { isOverdue, nextStatus, previousStatus } from "./task-status";

describe("navigation entre colonnes", () => {
  it("avance dans l'ordre des colonnes", () => {
    expect(nextStatus("TODO")).toBe("IN_PROGRESS");
    expect(nextStatus("IN_PROGRESS")).toBe("REVIEW");
    expect(nextStatus("REVIEW")).toBe("DONE");
  });

  it("recule dans l'ordre des colonnes", () => {
    expect(previousStatus("DONE")).toBe("REVIEW");
    expect(previousStatus("IN_PROGRESS")).toBe("TODO");
  });

  it("n'avance pas après Terminé et ne recule pas avant À faire", () => {
    expect(nextStatus("DONE")).toBeNull();
    expect(previousStatus("TODO")).toBeNull();
  });
});

describe("tâche en retard", () => {
  const now = new Date("2026-10-20T15:00:00Z");

  it("est en retard si l'échéance est passée", () => {
    expect(isOverdue(new Date("2026-10-19T00:00:00Z"), "TODO", now)).toBe(true);
  });

  it("n'est pas en retard le jour même de l'échéance", () => {
    expect(isOverdue(new Date("2026-10-20T00:00:00Z"), "TODO", now)).toBe(
      false,
    );
  });

  it("n'est pas en retard si l'échéance est future", () => {
    expect(
      isOverdue(new Date("2026-10-25T00:00:00Z"), "IN_PROGRESS", now),
    ).toBe(false);
  });

  it("n'est jamais en retard une fois terminée", () => {
    expect(isOverdue(new Date("2026-10-01T00:00:00Z"), "DONE", now)).toBe(
      false,
    );
  });

  it("n'est pas en retard sans échéance", () => {
    expect(isOverdue(null, "TODO", now)).toBe(false);
  });
});
