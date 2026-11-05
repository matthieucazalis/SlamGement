# Revue du code et corrections

Revue complète du projet (typecheck, lint, tests unitaires, build de production, tests sur une vraie base PostgreSQL et sur le serveur de production).

## Bugs corrigés

| Où                      | Problème                                                                                                                                | Correction                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `profile/page.tsx`      | Une commande Git (`git checkout dev…`) collée dans le JSX s'affichait sur la page Profil                                                | Texte supprimé                                                                   |
| `app/page.tsx`          | La page d'accueil était encore le modèle par défaut de Next.js                                                                          | Redirection vers `/projects`                                                     |
| Affichage des dates     | Le serveur est en UTC : heures affichées avec 1 à 2 h de décalage, filtres de date de l'historique faussés                              | `lib/format.ts` (fuseau `Europe/Paris`) + tests                                  |
| Numéros d'ADR           | `max(number)+1` : le numéro du dernier ADR supprimé était réattribué, ce qui casse les liens des `.md` exportés                         | Compteur `Project.adrCounter` incrémenté atomiquement (migration incluse)        |
| Limitation de connexion | Lecture puis écriture en deux temps : des tentatives simultanées étaient mal comptées                                                   | Une seule requête SQL atomique                                                   |
| Retrait d'un membre     | Ses tâches restaient assignées à une personne qui n'est plus membre                                                                     | Tâches désassignées dans la même transaction                                     |
| Remplacement d'un ADR   | Un ADR déprécié ou déjà remplacé pouvait être choisi comme remplaçant                                                                   | Seuls les ADR proposés ou acceptés sont acceptés                                 |
| Inscription             | Deux inscriptions simultanées avec le même email provoquaient une erreur 500                                                            | Contrainte d'unicité gérée (`EmailTakenError`)                                   |
| Connexion               | Le message « Compte créé » (`?registered=1`) n'était jamais affiché ; après connexion via un lien d'invitation, on perdait l'invitation | Message ajouté ; `callbackUrl` conservé et **validé** (anti redirection ouverte) |
| Chemins publics         | `startsWith("/invite")` laissait aussi passer `/inviteXYZ`                                                                              | Comparaison sur le segment exact                                                 |
| Mermaid                 | Un schéma invalide laissait des éléments d'erreur dans la page                                                                          | Validation avec `mermaid.parse` avant le rendu                                   |
| Rôles                   | `ADMIN` / `MEMBER` affichés en anglais                                                                                                  | Libellés français (`lib/roles.ts`)                                               |

## Éléments manquants (cités dans la documentation mais absents du projet)

`Dockerfile`, `docker-compose.prod.yml`, `.env.prod.example`, `.dockerignore`, `prisma/seed.mts` et le script `npm run db:seed`, ainsi que `package-lock.json`.

## Qualité et hygiène

- Lint : 19 erreurs corrigées (apostrophes, lien de la page hors ligne documenté).
- Code mort supprimé : `src/dashboard/page.tsx` (doublon du tableau de bord), `lib/validators/rate-limit.service.ts` (doublon du service), composants `dialog`, `table`, `badge`, `sonner`, images du modèle Next.js, dépendances `next-themes` et `sonner`.
- `prettier` et `dotenv` ajoutés aux dépendances (le script `format` et la config Prisma les utilisaient sans les déclarer) ; `tsx` ajouté pour le seed ; `shadcn` déplacé en dépendance de développement.
- Polices via le paquet `geist` : plus d'appel à Google Fonts au build.
- `.gitignore` corrigé : `.env.prod` n'était **pas** ignoré. Fins de ligne normalisées (`.gitattributes`).
- Index ajoutés sur `Invitation.projectId`, `Task.adrId`, `Task.assigneeId`.
- `docs/DEMONSTRATION` renommé en `DEMONSTRATION.md`.

## Vérifications réalisées

`tsc` sans erreur · `eslint` sans erreur · 53 tests unitaires (42 existants + 11 nouveaux) · build de production et build `standalone` démarrés · migrations et seed exécutés sur PostgreSQL 16 · correctifs des services vérifiés sur la base (créations parallèles, rafale d'échecs de connexion, inscriptions simultanées…) · contrôle d'accès vérifié par requêtes HTTP.

**Non exécutés ici** : les tests Playwright (pas de navigateur dans l'environnement) et la construction de l'image Docker (pas de Docker). À lancer chez toi : `npm run test:e2e` et `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`. Un seul test e2e a été adapté (`Ton rôle : Membre`).
