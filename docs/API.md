# API REST (v1)

API branchée sur les mêmes services métier que l'interface web : les droits (administrateur / membre) sont donc identiques.
Elle sert l'**application mobile** (`mobile/`) et reste utilisable par tout autre client.

- Description machine : `GET /api/v1/openapi.json` (OpenAPI 3.0) — page lisible : `/api-docs`
- Réponses : JSON ; erreurs au format `{ "error": { "code": "…", "message": "…", "fields": ["…"] } }`

## Authentification

| Client             | Méthode                                                                                       | Droits                            |
| ------------------ | --------------------------------------------------------------------------------------------- | --------------------------------- |
| Application mobile | `POST /auth/token` (email + mot de passe) → jeton `sgm_…`, puis `Authorization: Bearer sgm_…` | **Lecture et écriture**           |
| Navigateur         | Cookie de session du site                                                                     | **Lecture seule** (`GET`, `HEAD`) |

Pourquoi les écritures exigent un jeton : un navigateur envoie son cookie **automatiquement**, y compris depuis un site
malveillant (attaque CSRF). Un jeton, lui, n'est envoyé que par un programme qui le possède. Un `PATCH` avec cookie seul
renvoie donc `403 token_required`.

Le jeton : 256 bits aléatoires, **valable 30 jours**, stocké **haché** (SHA-256) côté serveur, **révocable** (`DELETE /auth/token`),
10 par utilisateur au maximum (les plus anciens sont oubliés), refusé si le compte est supprimé. La connexion mobile a les mêmes
protections que la connexion web : limite de tentatives par email et par IP, et **même réponse** pour un email inconnu et un mauvais
mot de passe.

## Routes

| Méthode et chemin                     | Rôle                                             | Corps / paramètres                                              |
| ------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| `POST /auth/token`                    | Connexion mobile (publique)                      | `email`, `password`, `deviceName?`                              |
| `DELETE /auth/token`                  | Déconnexion : révoque le jeton                   | —                                                               |
| `GET /me`                             | Utilisateur connecté (avec photo)                | —                                                               |
| `PUT /me/avatar`, `DELETE /me/avatar` | Photo de profil (data URL 256 px)                | `dataUrl`                                                       |
| `GET /projects`                       | Projets dont on est membre, avec le rôle         | —                                                               |
| `GET /projects/{id}`                  | Un projet                                        | —                                                               |
| `GET /projects/{id}/adrs`             | ADR du projet (résumés)                          | `status`, `q` (recherche)                                       |
| `POST /projects/{id}/adrs`            | Créer un ADR                                     | `title`, `context`, `decision`, `consequences`, `alternatives?` |
| `GET /projects/{id}/adrs/{number}`    | Un ADR complet                                   | —                                                               |
| `PATCH /projects/{id}/adrs/{number}`  | Changer le statut (règles de transition du site) | `status`, `replacement?`                                        |
| `GET /projects/{id}/messages`         | 50 derniers messages (`mine` = écrits par moi)   | —                                                               |
| `POST /projects/{id}/messages`        | Envoyer un message (texte brut, 2000 car. max)   | `body`                                                          |
| `GET /projects/{id}/tasks`            | Tâches du Kanban                                 | `assignee`, `q`                                                 |
| `PATCH /projects/{id}/tasks/{taskId}` | Déplacer une carte                               | `status`                                                        |

| Code            | Signification                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------- |
| 200 / 201 / 204 | Succès / créé / succès sans contenu                                                                |
| 400             | Paramètre ou JSON invalide                                                                         |
| 401             | Pas de jeton, jeton inconnu, expiré ou révoqué, compte supprimé ; ou identifiants faux (connexion) |
| 403             | Écriture avec un cookie au lieu d'un jeton (`token_required`)                                      |
| 404             | Ressource absente **ou projet dont on n'est pas membre** (on ne révèle pas son existence)          |
| 409             | Changement refusé dans l'état actuel (transition de statut interdite, ADR verrouillé)              |
| 413             | Corps trop gros                                                                                    |
| 422             | Données invalides (`fields` liste les champs en cause) ou référence invalide                       |
| 429             | Trop de tentatives de connexion, ou trop de messages envoyés (`POST /messages`) |
| 500             | Erreur inattendue (détail dans les journaux du serveur, jamais dans la réponse)                    |

> Les routes `/messages` sont gérées par `message.service` (droits de membre, quota de 15 messages par minute). Elles ne sont pas encore décrites dans `openapi.ts` ni utilisées par l'application mobile.

## Choix de conception

- Chaque réponse est construite champ par champ (`lib/api-serializers.ts`) : jamais d'objet Prisma brut.
- Les routes ne contiennent aucune règle métier : elles appellent `adr.service`, `task.service`… et traduisent leurs erreurs
  (`lib/api.ts`).
- `src/lib/openapi.test.ts` vérifie que chaque chemin **et chaque méthode** décrits existent dans un fichier `route.ts`.
- Le proxy laisse passer `/api/v1` : c'est l'API elle-même qui répond `401` en JSON.

## Exemple

```bash
TOKEN=$(curl -s -X POST localhost:3000/api/v1/auth/token \
  -H 'content-type: application/json' \
  -d '{"email":"alice@slamgement.test","password":"Demo-SlamGement-1"}' | jq -r .token)

curl -H "Authorization: Bearer $TOKEN" localhost:3000/api/v1/projects
```

## Évolutions possibles

Pagination, notifications push, création de tâches et de projets, suivi des appareils connectés (la table `ApiToken` garde déjà
le nom et la dernière utilisation).
