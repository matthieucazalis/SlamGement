# SlamGement

Application web de gestion de projet orientée **décisions d'architecture**.
Elle permet à une équipe d'organiser son travail et de documenter ses choix
techniques sous forme d'ADR (Architecture Decision Records).

Projet réalisé seul dans le cadre de l'épreuve finale du BTS SIO option SLAM.

## Fonctionnalités

- **Comptes et projets** : inscription, connexion, espaces de travail, invitation de collaborateurs
- **Rôles** : Administrateur ou Membre, définis par projet
- **Gestionnaire d'ADR** : formulaire structuré, cycle de vie des statuts, schémas Mermaid
- **Export Markdown** : un ADR ou tous les ADR d'un projet, prêts pour un dépôt Git
- **Traçabilité** : historique des actions et tableau de bord
- **Kanban** : tâches par colonne, assignation, échéances, lien avec les ADR

## Technologies

Next.js · TypeScript · Prisma · PostgreSQL · Auth.js · Tailwind CSS · Docker

## Installation

```bash
git clone <url-du-depot>
cd slamgement
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate dev
npm run dev
```

L'application est disponible sur http://localhost:3000.

## Documentation

- [Planning et jalons](docs/PLANNING.md)
- Diagrammes UML et modèle de données : `docs/diagrammes/`
- Maquettes : `docs/maquettes/`

## Avancement

Voir le planning. Version actuelle : _en conception_.

## Auteur

Matthieu CAZALIS, BTS SIO SLAM, année 2026-2027
