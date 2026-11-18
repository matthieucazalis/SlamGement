import { describe, expect, it } from "vitest";
import { echec } from "./echec";
import { ErreurApi, connexion, creerApi } from "./client";

// Test de CONTRAT : le vrai client de l'application contre un vrai serveur
// SlamGement (base de démonstration : `npm run db:seed` côté serveur). Ignoré
// tant que ces variables ne sont pas définies :
//   SLAM_API_URL=http://localhost:3000 SLAM_EMAIL=alice@slamgement.test \
//   SLAM_PASSWORD=Demo-SlamGement-1 npm test
const SLAM_API_URL = process.env.SLAM_API_URL;
const SLAM_EMAIL = process.env.SLAM_EMAIL;
const SLAM_PASSWORD = process.env.SLAM_PASSWORD;
const actif = !!(SLAM_API_URL && SLAM_EMAIL && SLAM_PASSWORD);

// PNG valide de 1 × 1 pixel
const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe.skipIf(!actif)("contrat client ↔ serveur", () => {
  const serveur = SLAM_API_URL as string;

  it("parcours complet : connexion, lecture, écritures, photo, déconnexion", async () => {
    // 1. un mauvais mot de passe est refusé, avec le même message qu'un email inconnu
    const refus = await echec(
      connexion(serveur, SLAM_EMAIL as string, "mauvais-mot-de-passe", "test"),
    );
    expect(refus).toBeInstanceOf(ErreurApi);
    expect(refus.code).toBe("identifiants");

    // 2. connexion
    const session = await connexion(
      serveur,
      SLAM_EMAIL as string,
      SLAM_PASSWORD as string,
      "Test de contrat",
    );
    expect(session.token).toMatch(/^sgm_/);
    const api = creerApi(serveur, session.token);

    // 3. profil et projets
    const moi = await api.moi();
    expect(moi.email).toBe(SLAM_EMAIL);
    const projets = await api.projets();
    const demo = projets.find((p) => p.name.includes("démonstration"));
    expect(
      demo,
      "le projet de démonstration doit exister (npm run db:seed)",
    ).toBeDefined();
    const id = (demo as { id: string }).id;
    expect((await api.projet(id)).role).toBe("ADMIN");

    // 4. lecture des ADR, recherche, détail
    const tous = await api.adrs(id);
    expect(tous.length).toBeGreaterThanOrEqual(6);
    const trouves = await api.adrs(id, "mongodb");
    expect(trouves.map((a) => a.title)).toContain("Utiliser MongoDB");
    const acceptes = await api.adrs(id, undefined, "ACCEPTED");
    expect(acceptes.every((a) => a.status === "ACCEPTED")).toBe(true);
    const detail = await api.adr(id, 2);
    expect(detail.supersedes).toBe(1);

    // 5. création d'un ADR : validation refusée, puis acceptée
    const invalide = await echec(
      api.creerAdr(id, {
        title: "x",
        context: "court",
        decision: "d".repeat(20),
        consequences: "c".repeat(20),
      }),
    );
    expect(invalide.code).toBe("validation");
    expect(invalide.champs).toEqual(
      expect.arrayContaining(["title", "context"]),
    );

    const cree = await api.creerAdr(id, {
      title: `ADR de contrat ${Date.now()}`,
      context: "Créé par le test de contrat",
      decision: "Vérifier le client mobile",
      consequences: "Un ADR de test en plus",
    });
    expect(cree.status).toBe("PROPOSED");

    // 6. changement de statut : autorisé, puis transition interdite (409 → « conflit »)
    expect(
      (await api.changerStatutAdr(id, cree.number, "ACCEPTED")).status,
    ).toBe("ACCEPTED");
    const interdit = await echec(
      api.changerStatutAdr(id, cree.number, "REJECTED"),
    );
    expect(interdit.code).toBe("conflit");

    // 7. Kanban : lecture, déplacement aller-retour
    const taches = await api.taches(id);
    expect(taches.length).toBeGreaterThanOrEqual(6);
    const todo = taches.find(
      (t) => t.status === "TODO",
    ) as (typeof taches)[number];
    expect((await api.deplacerTache(id, todo.id, "IN_PROGRESS")).status).toBe(
      "IN_PROGRESS",
    );
    expect((await api.taches(id)).find((t) => t.id === todo.id)?.status).toBe(
      "IN_PROGRESS",
    );
    await api.deplacerTache(id, todo.id, "TODO");

    // 8. photo : une image valide passe, un faux fichier est refusé
    expect((await api.envoyerPhoto(PNG)).avatar).toBe(PNG);
    expect((await api.moi()).avatar).toBe(PNG);
    const faux = await echec(
      api.envoyerPhoto(
        `data:image/png;base64,${btoa("<script>alert(1)</script>")}`,
      ),
    );
    expect(faux.code).toBe("image");
    await api.supprimerPhoto();
    expect((await api.moi()).avatar).toBeNull();

    // 9. un projet inconnu → « introuvable »
    expect((await echec(api.projet("projet-inconnu"))).code).toBe(
      "introuvable",
    );

    // 10. déconnexion : le jeton est révoqué CÔTÉ SERVEUR
    await api.deconnexion();
    const apres = await echec(api.moi());
    expect(apres.code).toBe("non_authentifie");
  });
});
