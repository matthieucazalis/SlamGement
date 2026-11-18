import { describe, expect, it } from "vitest";
import { normaliserAdresse } from "./adresse";

describe("normaliserAdresse", () => {
  it("ajoute http:// quand l'utilisateur l'oublie", () => {
    expect(normaliserAdresse("192.168.1.42:3000")).toBe(
      "http://192.168.1.42:3000",
    );
    expect(normaliserAdresse("localhost:3000")).toBe("http://localhost:3000");
  });

  it("garde https et retire les espaces et les « / » finaux", () => {
    expect(normaliserAdresse("  https://slam.example.fr/  ")).toBe(
      "https://slam.example.fr",
    );
    expect(normaliserAdresse("http://10.0.0.5:3000///")).toBe(
      "http://10.0.0.5:3000",
    );
  });

  it("supprime le chemin éventuel : on ne garde que le serveur", () => {
    expect(normaliserAdresse("http://10.0.0.5:3000/projects/abc")).toBe(
      "http://10.0.0.5:3000",
    );
  });

  it("refuse une saisie vide ou invalide", () => {
    expect(normaliserAdresse("")).toBeNull();
    expect(normaliserAdresse("   ")).toBeNull();
    expect(normaliserAdresse("http://")).toBeNull();
    expect(normaliserAdresse("pas une adresse")).toBeNull();
  });
});
