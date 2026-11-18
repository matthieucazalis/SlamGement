# Déploiement

## Prérequis

Docker et Docker Compose. Aucun autre outil n'est nécessaire sur le serveur.

## Configuration

```bash
cp .env.prod.example .env.prod
```

Renseigner dans `.env.prod` :

- `POSTGRES_PASSWORD` : `openssl rand -hex 16` (hexadécimal : il est inséré dans une URL)
- `AUTH_SECRET` : `openssl rand -base64 32`
- `AUTH_URL` : l'adresse publique du site. **Obligatoire en production** : elle sert à construire les liens
  envoyés par e-mail (le serveur n'utilise jamais l'en-tête `Host` fourni par le visiteur).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` : envoi des e-mails (mot de passe oublié).
  **Facultatif** : sans `SMTP_HOST`, le lien de réinitialisation est écrit dans les journaux
  (`docker compose -f docker-compose.prod.yml logs app`), ce qui suffit pour une démonstration.

`.env.prod` n'est jamais versionné.

## Démarrage

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Trois services démarrent dans l'ordre : `db` (PostgreSQL), `migrate` (applique
les migrations puis s'arrête), `app` (l'application, sur le port 3000 de la machine).

## Jeu de démonstration (facultatif)

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm migrate npx tsx prisma/seed.mts
```

## HTTPS

L'application écoute en local uniquement (`127.0.0.1:3000`). Placer devant un
reverse proxy qui gère le certificat, par exemple Caddy :

```
ton-domaine.example {
    reverse_proxy 127.0.0.1:3000
}
```

Le reverse proxy fournit l'adresse du client dans `x-forwarded-for`, que la
limitation des tentatives de connexion utilise : l'application ne doit donc
jamais être exposée directement.

## Mise à jour

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Les migrations sont appliquées automatiquement. Les données PostgreSQL sont
dans le volume `pgdata`, conservé entre les mises à jour.

## Sauvegarde

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec db \
  pg_dump -U slamgement slamgement > sauvegarde.sql
```

## Application mobile

Le serveur déployé sert aussi l'API de l'application mobile (`/api/v1`). Pour un **`.apk` installé** (hors Expo Go), le site
doit être en **HTTPS** : Android refuse le trafic `http://` non chiffré. Voir `mobile/README.md` (section « Installer l'application
sans Expo Go »).
