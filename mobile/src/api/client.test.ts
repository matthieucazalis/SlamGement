import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { echec } from "./echec";
import { ErreurApi, appel, connexion, creerApi } from "./client";

const SERVEUR = "http://serveur.test";

function reponse(statut: number, corps?: unknown) {
  return new Response(corps === undefined ? null : JSON.stringify(corps), {
    status: statut,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const dernierAppel = () => {
  const [url, init] = fetchMock.mock.calls.at(-1) as [
    string,
    RequestInit & { headers: Record<string, string> },
  ];
  return { url, init };
};

describe("appel", () => {
  it("envoie le jeton dans l'en-tête Authorization et lit le JSON", async () => {
    fetchMock.mockResolvedValue(reponse(200, { id: "u1" }));
    const resultat = await appel<{ id: string }>(SERVEUR, "/me", {
      jeton: "sgm_abc",
    });

    expect(resultat).toEqual({ id: "u1" });
    const { url, init } = dernierAppel();
    expect(url).toBe("http://serveur.test/api/v1/me");
    expect(init.headers.Authorization).toBe("Bearer sgm_abc");
    expect(init.method).toBe("GET");
  });

  it("n'envoie pas d'en-tête Authorization sans jeton", async () => {
    fetchMock.mockResolvedValue(reponse(200, {}));
    await appel(SERVEUR, "/projects");
    expect(dernierAppel().init.headers.Authorization).toBeUndefined();
  });

  it("envoie le corps en JSON", async () => {
    fetchMock.mockResolvedValue(reponse(200, {}));
    await appel(SERVEUR, "/x", { methode: "POST", corps: { a: 1 } });
    const { init } = dernierAppel();
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe('{"a":1}');
  });

  it("gère une réponse 204 sans corps", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(
      appel(SERVEUR, "/me/avatar", { methode: "DELETE" }),
    ).resolves.toBeUndefined();
  });

  it.each([
    [401, { error: { code: "unauthenticated" } }, "non_authentifie"],
    [401, { error: { code: "invalid_credentials" } }, "identifiants"],
    [429, { error: { code: "too_many_attempts" } }, "trop_de_tentatives"],
    [404, { error: { code: "not_found" } }, "introuvable"],
    [409, { error: { code: "conflict" } }, "conflit"],
    [422, { error: { code: "validation", fields: ["title"] } }, "validation"],
    [422, { error: { code: "invalid_image" } }, "image"],
    [500, { error: { code: "internal_error" } }, "serveur"],
    [418, undefined, "inconnue"],
  ])(
    "convertit le statut %i en erreur « %s » typée",
    async (statut, corps, code) => {
      fetchMock.mockResolvedValue(reponse(statut, corps));
      const erreur = await echec(appel(SERVEUR, "/x"));
      expect(erreur).toBeInstanceOf(ErreurApi);
      expect(erreur.code).toBe(code);
      expect(erreur.statut).toBe(statut);
    },
  );

  it("transmet la liste des champs invalides", async () => {
    fetchMock.mockResolvedValue(
      reponse(422, {
        error: { code: "validation", fields: ["title", "context"] },
      }),
    );
    const erreur = await echec(appel(SERVEUR, "/x"));
    expect(erreur.champs).toEqual(["title", "context"]);
  });

  it("signale une panne réseau (serveur éteint, mauvaise adresse)", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));
    const erreur = await echec(appel(SERVEUR, "/x"));
    expect(erreur.code).toBe("reseau");
  });

  it("signale un délai dépassé", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_ok, rejeter) => {
          init.signal?.addEventListener("abort", () =>
            rejeter(Object.assign(new Error("abort"), { name: "AbortError" })),
          );
        }),
    );
    const promesse = echec(appel(SERVEUR, "/x"));
    await vi.advanceTimersByTimeAsync(15_001);
    expect((await promesse).code).toBe("delai");
  });

  it("une réponse non JSON sur une erreur ne plante pas", async () => {
    fetchMock.mockResolvedValue(
      new Response("<html>Bad gateway</html>", { status: 502 }),
    );
    const erreur = await echec(appel(SERVEUR, "/x"));
    expect(erreur.code).toBe("serveur");
  });
});

describe("fonctions de l'API", () => {
  const api = creerApi(SERVEUR, "sgm_jeton");

  it("construit la recherche d'ADR en encodant le texte", async () => {
    fetchMock.mockResolvedValue(reponse(200, { data: [] }));
    await api.adrs("p1", "  base de données & co  ", "ACCEPTED");
    const { url } = dernierAppel();
    expect(url).toContain("/projects/p1/adrs?");
    expect(new URL(url).searchParams.get("q")).toBe("base de données & co");
    expect(new URL(url).searchParams.get("status")).toBe("ACCEPTED");
  });

  it("n'ajoute aucun paramètre quand la recherche est vide", async () => {
    fetchMock.mockResolvedValue(reponse(200, { data: [] }));
    await api.adrs("p1", "   ");
    expect(dernierAppel().url).toBe(
      "http://serveur.test/api/v1/projects/p1/adrs",
    );
  });

  it("encode l'identifiant de projet dans l'URL", async () => {
    fetchMock.mockResolvedValue(reponse(200, { data: [] }));
    await api.taches("a/b c");
    expect(dernierAppel().url).toContain("/projects/a%2Fb%20c/tasks");
  });

  it("déplace une tâche avec PATCH et le nouveau statut", async () => {
    fetchMock.mockResolvedValue(reponse(200, { id: "t1", status: "DONE" }));
    await api.deplacerTache("p1", "t1", "DONE");
    const { url, init } = dernierAppel();
    expect(url).toBe("http://serveur.test/api/v1/projects/p1/tasks/t1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ status: "DONE" });
  });

  it("connexion envoie email, mot de passe et nom d'appareil, sans jeton", async () => {
    fetchMock.mockResolvedValue(
      reponse(200, {
        token: "sgm_x",
        expiresAt: "2026-12-01",
        user: { id: "u", name: "N", email: "e@x.fr" },
      }),
    );
    const r = await connexion(SERVEUR, "e@x.fr", "secret", "Mobile (android)");
    expect(r.token).toBe("sgm_x");
    const { url, init } = dernierAppel();
    expect(url).toBe("http://serveur.test/api/v1/auth/token");
    expect(init.headers.Authorization).toBeUndefined();
    expect(JSON.parse(init.body as string)).toEqual({
      email: "e@x.fr",
      password: "secret",
      deviceName: "Mobile (android)",
    });
  });
});
