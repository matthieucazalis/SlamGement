# SlamGement

Application web de gestion de projet orientée **décisions d'architecture**.
Une équipe y organise son travail (tableau Kanban) et documente ses choix
techniques sous forme d'ADR (Architecture Decision Records), avec export
Markdown prêt pour un dépôt Git.

Projet réalisé seul, dans le cadre de la fin de formation du BTS SIO option SLAM.

## Fonctionnalités

- **Comptes et projets** : inscription, connexion, profil, espaces de travail
- **Rôles par projet** : administrateur ou membre, invitation par lien à usage unique
- **ADR** : formulaire structuré, cycle de vie des statuts, remplacement d'une décision par une autre
- **Rendu** : Markdown et schémas Mermaid, aperçu en direct
- **Export** : un ADR ou tous les ADR d'un projet (ZIP), au format Markdown
- **Kanban** : 4 colonnes, assignation, échéances, filtres, lien tâche ↔ ADR
- **Traçabilité** : historique des actions, tableau de bord
- **Installable** sur téléphone (PWA)

## Technologies

Next.js · TypeScript · Prisma · PostgreSQL · Auth.js · Tailwind CSS · shadcn/ui ·
Vitest · Playwright · Docker

## Lancer en développement

```bash
git clone <url-du-depot>
cd slamgement
cp .env.example .env        # puis renseigner AUTH_SECRET (openssl rand -base64 32)
                            # (le fichier .env n'est jamais versionné)
docker compose up -d        # base PostgreSQL
npm install
npx prisma migrate dev
npm run db:seed             # jeu de démonstration (facultatif)
npm run dev
```

L'application est disponible sur http://localhost:3000.

Comptes de démonstration (après `npm run db:seed`) :
`alice@slamgement.test` (administratrice), `bruno@slamgement.test` et
`chloe@slamgement.test` (membres). Mot de passe : `Demo-SlamGement-1`.

## Tests

```bash
npm run typecheck   # vérification TypeScript
npm run lint        # ESLint
npm test            # tests unitaires (règles métier)
npm run test:e2e    # tests de bout en bout (voir docs/TESTS.md pour la base de test)
```

## Déploiement

Une image Docker et une stack de production sont fournies : voir
[docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md).

## Documentation

- [Architecture et diagrammes](docs/ARCHITECTURE.md)
- [Sécurité](docs/SECURITE.md)
- [Tests](docs/TESTS.md)
- [Déploiement](docs/DEPLOIEMENT.md)
- [Manuel utilisateur](docs/MANUEL.md)
- [Planning et suivi réel](docs/PLANNING.md)

## Auteur

Prénom Nom, BTS SIO SLAM, 2026-2027
