# Sécurité de SlamGement

Ce document présente les risques identifiés, les mesures mises en œuvre, les
preuves associées et les **limites assumées**. Les catégories reprennent
l'OWASP Top 10 ; leurs noms et leur numérotation évoluent d'une version à
l'autre, à vérifier sur la version en vigueur.

## 1. Périmètre

**Ce qu'on protège** : les comptes (email, mot de passe), le contenu des
projets (décisions, tâches), la séparation entre projets, et le journal
d'audit.

**Qui peut agir** : un visiteur anonyme, un utilisateur connecté, un membre,
un administrateur de projet, et un attaquant qui connaît les URL et peut
forger des requêtes.

**Principe directeur** : tout contrôle de sécurité est fait **côté serveur**,
dans les services. L'interface masque les boutons interdits par confort, mais
ne protège rien.

## 2. Synthèse par catégorie OWASP

| Catégorie                     | Risque                                | Mesure                                                                                                   | Preuve                                      |
| ----------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Contrôle d'accès              | Lire ou modifier le projet d'un autre | `requireRole` dans chaque service ; filtre sur `projectId` à chaque requête ; 404 pour un non-membre     | Test e2e 10 ; tests manuels B3, E9          |
| Défaillances cryptographiques | Mots de passe ou jetons lisibles      | bcrypt (12 tours) ; jeton d'invitation de 256 bits, stocké **haché** (SHA-256) ; `AUTH_SECRET` aléatoire | Prisma Studio (`passwordHash`, `tokenHash`) |
| Injection                     | SQL, XSS                              | Prisma (requêtes paramétrées) ; validation Zod ; Markdown sans HTML brut ; Mermaid en mode strict        | Tests e2e 8, 9 ; manuel D6                  |
| Conception non sécurisée      | Règles métier contournables           | Transitions de statut, dernier administrateur, assignation et liaison contrôlées par le serveur          | Tests unitaires `adr-status` ; e2e 7        |
| Mauvaise configuration        | En-têtes absents, secrets exposés     | En-têtes de sécurité et CSP ; `.env` et `.env.prod` ignorés par Git ; base non exposée                   | Manuel G2, G3, G5                           |
| Composants vulnérables        | Dépendances avec failles connues      | `npm audit` avant chaque jalon ; mises à jour ; tri documenté                                            | Section 5                                   |
| Authentification              | Force brute, énumération de comptes   | 5 échecs par email et 20 par IP en 15 min ; message unique ; temps de réponse constant ; session de 8 h  | Tests e2e 3, 4, 6 ; unitaires `rate-limit`  |
| Intégrité des données         | Actions concurrentes incohérentes     | Transactions ; contraintes d'unicité ; réessai pour la numérotation                                      | Section 3.4                                 |
| Journalisation                | Actions non traçables                 | Journal d'audit écrit dans la **même transaction** que l'action                                          | Test e2e 12 ; manuel F1                     |

## 3. Détail des mesures

### 3.1 Authentification et sessions

- **Mots de passe** : 8 caractères minimum, 72 maximum (bcrypt ignore ce qui dépasse), hachés avec bcrypt à 12 tours. Jamais stockés ni journalisés en clair.
- **Message d'échec unique** : « Identifiants invalides » pour un email inconnu comme pour un mauvais mot de passe.
- **Temps de réponse constant** : quand l'email n'existe pas, on calcule quand même un hachage factice, pour qu'un chronométrage ne révèle pas l'existence d'un compte.
- **Limitation des tentatives** : 5 échecs par email et 20 par adresse IP dans une fenêtre de 15 minutes, comptés en base (`RateLimit`). Le contrôle est dans `authorize` (Auth.js), donc il s'applique aussi à quelqu'un qui appellerait directement l'URL d'authentification sans passer par la page. Un succès remet le compteur de l'email à zéro. Le compteur est incrémenté par **une seule requête SQL atomique** (`INSERT … ON CONFLICT DO UPDATE`) : des tentatives simultanées sont toutes comptées.
- **Redirection après connexion** : le paramètre `callbackUrl` est une entrée utilisateur ; seul un chemin interne est accepté (`safeCallbackPath`), ce qui empêche la redirection ouverte vers un site tiers.
- **Sessions** : JWT signé, valable **8 heures** au lieu des 30 jours par défaut.
- **Choix d'architecture** : pas d'adaptateur Prisma pour Auth.js, car notre modèle `User` porte déjà son `passwordHash` ; le fournisseur Credentials impose de toute façon des sessions JWT.

### 3.2 Autorisation

- **Rôle par projet** : administrateur ou membre, porté par la table `Membership`.
- **`requireRole`** est appelé dans **chaque service** qui touche un projet. Un layout ou un proxy n'est jamais la seule protection.
- **404 plutôt que 403** : un non-membre ne peut pas savoir qu'un projet existe.
- **Ressources liées** : une tâche ne peut être assignée qu'à un membre du projet, et liée qu'à un ADR du même projet, même si la requête est forgée.
- **Règle du dernier administrateur** : un projet garde toujours au moins un administrateur, vérifiée dans la transaction de modification.
- **Droits réservés aux administrateurs** : suppression d'un projet (avec saisie du nom), suppression d'un ADR, invitations, gestion des rôles, historique.

### 3.3 Invitations

- Jeton de 32 octets aléatoires ; **seul son hachage SHA-256 est stocké**.
- Expiration à 7 jours, **usage unique** (acceptation « réservée » par une mise à jour conditionnelle, donc sûre même si deux clics arrivent en même temps).
- Liée à une **adresse email précise** : un autre compte ne peut pas l'utiliser.
- Création, acceptation et trace d'audit dans une seule transaction.

### 3.4 Intégrité

- Toute action qui modifie des données écrit sa trace d'audit **dans la même transaction** : jamais de changement sans trace, ni l'inverse.
- Numérotation des ADR : maximum + 1 dans le projet, **contrainte d'unicité** `(projet, numéro)`, nouvelle tentative en cas de collision.
- Un ADR ne peut en remplacer qu'un seul (`supersededById` unique) ; un ADR qui en remplace un autre ne peut pas être supprimé.
- Les paramètres d'URL (filtres, pagination) sont **validés** ; une valeur invalide est ignorée, jamais transmise à la base.

### 3.5 Contenu affiché

- **Markdown** : rendu par `react-markdown` sans interprétation du HTML brut ; images distantes bloquées (pistage) ; liens ouverts avec `noopener noreferrer` ; les liens `javascript:` ne survivent pas.
- **Mermaid** : niveau de sécurité `strict`. L'injection du SVG produit par la bibliothèque est le **seul** endroit où du HTML est inséré dans la page.
- **Exports** : routes protégées par la session et par `requireRole`, avec `X-Content-Type-Options: nosniff`.

### 3.6 En-têtes HTTP

| En-tête                     | Valeur                                                                                                                                                           | Rôle                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `Content-Security-Policy`   | `default-src 'self'`, scripts, styles, images, polices et connexions limités à l'origine ; `frame-ancestors 'none'` ; `object-src 'none'` ; `form-action 'self'` | Limite l'impact d'une injection              |
| `X-Content-Type-Options`    | `nosniff`                                                                                                                                                        | Empêche l'interprétation d'un type inattendu |
| `X-Frame-Options`           | `DENY`                                                                                                                                                           | Anti-clickjacking                            |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                                                                                | Limite les fuites d'URL                      |
| `Permissions-Policy`        | caméra, micro, géolocalisation désactivés                                                                                                                        | Réduit la surface                            |
| `Strict-Transport-Security` | 2 ans, en production uniquement                                                                                                                                  | Force le HTTPS                               |

Vérification : `curl -I http://localhost:3100/login` sur le build de production.

### 3.7 Application installable (PWA)

Le service worker ne met en cache **que la page « hors ligne »**. Aucune page
de l'application et aucune donnée ne sont stockées sur l'appareil : rien ne
subsiste après une déconnexion, même sur un poste partagé. Le fichier du
service worker est servi sans cache, avec sa propre politique de contenu.

### 3.8 Secrets, conteneur et déploiement

- `.env` et `.env.prod` ne sont **jamais versionnés** ; seuls les modèles `.env.example` et `.env.prod.example` le sont.
- Image Docker en plusieurs étapes : l'image finale ne contient ni code source ni outils de développement ; l'application tourne avec un **utilisateur non privilégié**.
- La base de données **ne publie aucun port** ; l'application n'écoute que sur `127.0.0.1` et se place derrière un reverse proxy HTTPS.
- L'adresse du client est lue dans `x-forwarded-for` : elle n'est fiable que derrière un proxy de confiance, d'où l'interdiction d'exposer l'application directement.

## 4. Tests de sécurité réalisés

| Test                                                           | Résultat attendu              | Référence                |
| -------------------------------------------------------------- | ----------------------------- | ------------------------ |
| Accès aux 9 pages et exports d'un projet par un non-membre     | 404 partout                   | e2e 10                   |
| Accès sans session                                             | Redirection vers la connexion | e2e 1, 11                |
| Mauvais mot de passe, email inconnu                            | Même message                  | e2e 3, 4                 |
| 5 échecs puis bon mot de passe                                 | Blocage                       | e2e 6                    |
| Scripts, images, liens `javascript:` dans un ADR               | Aucune exécution              | e2e 8                    |
| Schéma Mermaid sous CSP de production                          | Affiché, aucune violation     | e2e 9                    |
| Lien d'invitation réutilisé, ou ouvert par un autre compte     | Refusé                        | e2e 12 ; manuel B7, B8   |
| Assignation à un non-membre, lien vers l'ADR d'un autre projet | Refusés par le serveur        | manuel E7, E8            |
| `callbackUrl` pointant vers un site externe                    | Réduit à un chemin interne    | unitaire `safe-redirect` |
| Manifeste et service worker accessibles sans session           | Statut 200, sans redirection  | e2e 14 à 17              |

## 5. Gestion des vulnérabilités des dépendances

Le premier `npm audit --omit=dev` a signalé 19 alertes. Elles ont été triées
selon qu'elles s'appliquent ou non à l'application déployée.

| Composant                                                                                 | Gravité  | S'applique à SlamGement ?                                | Décision                               |
| ----------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------- | -------------------------------------- |
| Next.js                                                                                   | Critique | **Oui** (Server Actions utilisées)                       | Mis à jour vers une version corrigée   |
| DOMPurify (via Mermaid)                                                                   | Critique | **Oui** (nettoyage des schémas)                          | Mis à jour par `npm audit fix`         |
| Zod                                                                                       | Élevée   | Oui, mais la faille concerne de très grandes collections | Mis à jour par `npm audit fix`         |
| Prisma CLI, `mysql2`, `deepmerge-ts`                                                      | Élevée   | Non : outil de développement, base PostgreSQL            | Mis à jour ou risque accepté           |
| Chaîne de la CLI `shadcn` (`@modelcontextprotocol/sdk`, `body-parser`, `undici`, `qs`...) | Élevée   | Non : jamais exécutée par le site                        | Risque accepté, suivi des mises à jour |

**Résultat final** : [à compléter : sortie de `npm audit --omit=dev` du JJ/MM/AAAA, et liste des alertes restantes avec leur justification].

Règle : relancer `npm audit --omit=dev` avant chaque jalon, sans jamais utiliser `--force`
qui peut changer de version majeure et casser Prisma ou Next.js.

## 6. Données personnelles (RGPD)

| Donnée                              | Où                                                        | Pourquoi                         |
| ----------------------------------- | --------------------------------------------------------- | -------------------------------- |
| Nom, email                          | `User`                                                    | Identifier la personne           |
| Mot de passe                        | `User`, **haché**                                         | Authentification                 |
| Email invité                        | `Invitation`, et `AuditLog` (métadonnées de l'invitation) | Lier l'invitation à une personne |
| Actions effectuées                  | `AuditLog`                                                | Traçabilité                      |
| Email ou IP des échecs de connexion | `RateLimit`                                               | Limitation des tentatives        |
| Cookie de session                   | Navigateur                                                | Maintenir la connexion           |

- Le cookie de session est **strictement nécessaire** au fonctionnement ; il est posé par Auth.js. À vérifier dans les outils de développement (onglet Application, Cookies) : attributs `HttpOnly` et `SameSite`. L'application n'utilise aucun traceur ni service tiers (images distantes bloquées, polices et scripts servis par le site lui-même).
- **Minimisation** : seules les données nécessaires sont collectées.
- **Conservation** : les invitations acceptées ou expirées, les entrées d'audit et les compteurs de limitation ne sont **pas purgés** automatiquement.
- **Droits des personnes** : l'accès et la rectification existent via la page de profil. **L'effacement et la portabilité ne sont pas implémentés.**

## 7. Limites connues et améliorations

| Limite                                                      | Conséquence                                                                                                                 | Amélioration possible                                  |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Sessions JWT non révocables avant 8 h                       | Un compte compromis reste actif jusqu'à l'expiration                                                                        | Sessions en base ou liste de révocation                |
| **Pas de réinitialisation de mot de passe**                 | Un mot de passe oublié bloque le compte                                                                                     | Jeton envoyé par email                                 |
| **Email non vérifié** à l'inscription                       | Un compte peut porter une adresse qui n'est pas la sienne ; la sécurité d'une invitation repose alors sur le secret du lien | Confirmation par email                                 |
| Pas d'authentification à deux facteurs                      | Mot de passe seul                                                                                                           | TOTP                                                   |
| Politique de mot de passe minimale (longueur)               | Mots de passe faibles possibles                                                                                             | Liste de mots de passe courants                        |
| Limitation par email exploitable                            | Quelqu'un peut bloquer le compte d'un autre 15 minutes                                                                      | Délais croissants, ou limitation par couple email + IP |
| Table `RateLimit` jamais purgée                             | Croissance, et conservation d'adresses                                                                                      | Tâche de purge                                         |
| CSP avec `'unsafe-inline'`                                  | Protection contre le XSS moins stricte                                                                                      | CSP à nonce                                            |
| Pas de suppression de compte                                | Droit à l'effacement non couvert                                                                                            | Suppression avec anonymisation des entrées d'audit     |
| Règle du dernier administrateur non testée sous concurrence | Deux rétrogradations simultanées pourraient théoriquement passer                                                            | Niveau d'isolation `Serializable`                      |
| Modification simultanée d'une tâche                         | La dernière écriture l'emporte                                                                                              | Contrôle de version                                    |
| Alertes de dépendances acceptées (CLI `shadcn`, Prisma CLI) | Risque limité aux outils de développement                                                                                   | Suivi des mises à jour                                 |
| Pas de confirmation avant « Retirer » un membre             | Action immédiate                                                                                                            | Boîte de dialogue de confirmation                      |

Points à confirmer dans la documentation de ta version de Next.js : la vérification de l'en-tête
`Origin` par les Server Actions (protection contre les requêtes intersites), et la politique de cookies d'Auth.js.

## 8. Vérification avant livraison

```bash
npm audit --omit=dev
npm run build
npm test
npm run test:e2e
git ls-files | grep -E "^\.env" ; git check-ignore -v .env .env.prod
```

Le dernier contrôle ne doit lister que `.env.example` et `.env.prod.example`,
et les deux fichiers de secrets doivent être signalés comme ignorés.
