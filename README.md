# SlamGement

Application web de gestion de projet orientée **décisions d'architecture**.
Une équipe y organise son travail (tableau Kanban) et documente ses choix
techniques sous forme d'ADR (Architecture Decision Records), avec export
Markdown prêt pour un dépôt Git.

Projet réalisé seul, dans le cadre de la fin de formation du BTS SIO option SLAM.

## Fonctionnalités

- **Comptes et projets** : inscription, connexion, mot de passe oublié, profil avec photo, espaces de travail
- **3 langues** (français, anglais, allemand) et **mode clair / sombre / système**, enregistrés sur le compte
- **Données personnelles (RGPD)** : export JSON, suppression du compte avec anonymisation, pages légales
- **Rôles par projet** : administrateur ou membre, invitation par lien à usage unique
- **ADR** : formulaire structuré, cycle de vie des statuts, remplacement d'une décision par une autre
- **Rendu** : Markdown et schémas Mermaid, aperçu en direct
- **Export** : un ADR ou tous les ADR d'un projet (ZIP), au format Markdown
- **Kanban** : 4 colonnes, assignation, échéances, filtres, lien tâche ↔ ADR
- **Traçabilité** : historique des actions, tableau de bord
- **Messagerie de projet** : discussion en texte brut entre les membres (50 derniers messages, limitation du débit)
- **Recherche** dans les ADR et les tâches
- **API REST** documentée (OpenAPI), avec connexion par jeton révocable
- **Application mobile** React Native / Expo (`mobile/`) : projets, ADR, Kanban, photo de profil, vibrations, hors ligne partiel
- **Installable** sur téléphone (PWA), avec vibrations (retour haptique) et appareil photo

## Technologies

Next.js · TypeScript · Prisma · PostgreSQL · Auth.js · Tailwind CSS · shadcn/ui ·
Vitest · Playwright · Docker · GitHub Actions · React Native / Expo (mobile)

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
npm run test:integration  # tests sur une vraie base *_test (voir docs/TESTS.md)
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
- [Langues et thème](docs/I18N.md)
- [API REST](docs/API.md)
- [Application mobile](mobile/README.md)
- [Rapport des améliorations](docs/RAPPORT_AMELIORATIONS.md)
- [Revue du code et corrections](docs/CORRECTIONS.md)
- [Préparation de la soutenance](docs/DEMONSTRATION.md)

## Auteur

Prénom Nom, BTS SIO SLAM, 2026-2027
