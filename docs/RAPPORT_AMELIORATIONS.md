# Rapport des améliorations

Ce rapport décrit, **fonctionnalité par fonctionnalité**, ce qui a été fait, les fichiers concernés
(`+` créé, `~` modifié, `−` supprimé) et comment cela a été vérifié. Il complète `docs/CORRECTIONS.md`
(revue du code existant, lot précédent).

**Résultat global** : TypeScript et ESLint sans erreur (site **et** application mobile) · 87 tests unitaires du site (53 avant) ·
42 tests d'intégration sur vraie base (nouveau) · 33 scénarios Playwright (21 avant ; 24/33 réussis au premier passage chez toi,
les 9 échecs étaient dans les tests et sont corrigés) · **application mobile Expo : 52 tests dont un test de contrat contre le
vrai serveur**, bundles Android / iOS / web générés · build de production et build `standalone` démarrés · 18 pages testées en
français, anglais et allemand.

| #   | Fonctionnalité                            | Demandé | Critère visé                          |
| --- | ----------------------------------------- | :-----: | ------------------------------------- |
| 1   | Langues FR / EN / DE                      |    ✔    | Paramètres                            |
| 2   | Mode clair / sombre / système             |    ✔    | Paramètres                            |
| 3   | Page Paramètres et raccourcis             |    ✔    | Paramètres                            |
| 4   | Retour haptique (vibrations)              |         | Fonction du téléphone                 |
| 5   | Photo de profil (appareil photo, galerie) |         | Fonction du téléphone                 |
| 6   | Brouillon d'ADR enregistré sur l'appareil |         | Données enregistrées sur l'appareil   |
| 7   | Recherche dans les ADR et les tâches      |         | « Filtres & Recherche » du périmètre  |
| 8   | Tableau de bord complété                  |         | Dashboard croisé tâches / décisions   |
| 9   | Mot de passe oublié                       |         | Limite listée dans `SECURITE.md`      |
| 10  | RGPD : export, suppression, pages légales |         | Limite listée dans `SECURITE.md`      |
| 11  | API REST v1 + OpenAPI                     |         | « API », réutilisation par app mobile |
| 12  | Navigation globale et accessibilité       |         | Qualité                               |
| 13  | Tests d'intégration et nouveaux tests e2e |         | Qualité                               |
| 14  | Intégration continue, Docker, e-mails     |         | Déploiement, qualité                  |
| 15  | Purge des données expirées                |         | RGPD (minimisation)                   |
| 16  | API mobile : jetons et écritures          |         | « Données venant d'une API »          |
| 17  | **Application mobile React Native**       |    ✔    | Fiche séance 5 (tous les critères)    |
| 18  | Messagerie de projet                      |         | Collaboration d'équipe                |

---

## 1. Langues : français, anglais, allemand

**Objectif** : toute l'interface, les messages d'erreur, l'historique, les e-mails et les exports existent en 3 langues.

**Réalisation**

- Système de traduction maison (aucune dépendance) : `t("domaine.cle", { variables })`, pluriels (`"1 action|{count} actions"`),
  dates formatées selon la langue (toujours en heure de Paris).
- **Une traduction oubliée est une erreur de compilation** : chaque fichier de domaine contient les 3 langues côte à côte et
  `en`/`de` sont typés sur la forme du français.
- Langue choisie dans cet ordre : cookie → préférence du compte → en-tête `Accept-Language` du navigateur → français.
- Les schémas Zod renvoient des clés de traduction (`validation.min8`), traduites à l'affichage.
- L'export Markdown d'un ADR suit la langue (titres de section) ; le statut reste en anglais (vocabulaire MADR).
- `<html lang>` suit la langue (lecteurs d'écran, correcteur orthographique).

**Fichiers**

- `+` `src/i18n/config.ts`, `translate.ts`, `server.ts`, `client.tsx`, `actions.ts`
- `+` `src/i18n/messages/` : `index.ts`, `types.ts`, `common.ts`, `validation.ts`, `errors.ts`, `auth.ts`, `nav.ts`, `settings.ts`,
  `roles.ts`, `profile.ts`, `projects.ts`, `members.ts`, `invite.ts`, `adr.ts`, `kanban.ts`, `dashboard.ts`, `history.ts`,
  `audit.ts`, `email.ts`, `legal.ts`
- `+` `src/lib/labels.ts`, `src/lib/validators/messages.ts` · `−` `src/lib/roles.ts`
- `~` `src/lib/format.ts`, `audit-labels.ts`, `adr-markdown.ts`, `adr-status.ts`, `task-status.ts`, `validators/*.ts`
- `~` toutes les pages et formulaires : `src/app/layout.tsx`, `(auth)/**`, `(app)/projects/**`, `(app)/profile/**`,
  `invite/[token]/page.tsx`, `offline/page.tsx`, `components/adr-status-badge.tsx`, `components/mermaid-diagram.tsx`
- `~` `src/services/adr.service.ts`, `member.service.ts`, `task.service.ts`, `user.service.ts`
- `+` `src/i18n/i18n.test.ts` · `~` `src/lib/audit-labels.test.ts`
- Documentation : `docs/I18N.md`

**Vérification** : 24 tests (dictionnaires de mêmes clés, mêmes variables, mêmes pluriels ; choix de la langue ; validation
traduite ; phrases d'historique en 3 langues). Test HTTP : 9 pages × 2 langues sans aucun mot français résiduel (hors données
de démonstration), priorité cookie / compte / navigateur contrôlée.

---

## 2. Mode clair / sombre / système

**Réalisation** : trois choix. « Sombre » pose la classe `dark` **côté serveur** (aucun éclair blanc au chargement). « Système »
suit le réglage de l'appareil, y compris quand il change pendant l'utilisation (petit script exécuté avant l'affichage).
Les couleurs d'erreur, de succès et des badges ont leur variante sombre ; les schémas Mermaid passent en thème sombre.

**Fichiers** : `+` `src/components/theme-sync.tsx` · `~` `src/app/layout.tsx`, `src/app/globals.css`,
`src/components/adr-status-badge.tsx`, `components/mermaid-diagram.tsx` et tous les messages d'erreur (`text-red-600 dark:text-red-400`).

**Vérification** : HTTP (`theme=dark` → `class="dark"`, `theme=system` → script, cookie invalide ignoré) ; e2e `settings.spec.ts` (non exécuté).

## 3. Page Paramètres et raccourcis

**Réalisation** : page `/settings` (langue, apparence, retour haptique), effet immédiat, enregistrée **sur le compte**
(`User.locale/theme/haptics`) et en cookie : les réglages suivent la personne d'un appareil à l'autre. Raccourcis langue et thème
dans la barre du haut, **y compris sur les pages de connexion et d'inscription**.

**Fichiers** : `+` `src/app/(app)/settings/page.tsx`, `preferences-form.tsx` · `+` `src/components/preferences-bar.tsx` ·
`+` `src/i18n/actions.ts` · `~` `prisma/schema.prisma` · `+` `prisma/migrations/20261106100000_preferences_avatar_password_reset/migration.sql`

**Vérification** : repli sur la préférence du compte contrôlé en base (`de` + `dark` retrouvés sans cookie).

## 4. Retour haptique

**Équivalent web d'`expo-haptics`** (fiche React Native, exercice 2) : vibration légère sur les changements de statut et les
déplacements de cartes, vibration d'erreur sur les suppressions, vibration de réussite quand une photo est enregistrée.
Désactivable dans les Paramètres. Fonctionne sur Android ; iOS n'expose pas l'API (l'appel est alors sans effet, sans erreur).

**Fichiers** : `+` `src/components/haptics.tsx` (attribut `data-haptic="light|success|error"`, un seul écouteur global) ·
`~` boutons des pages Kanban, ADR, membres, projet, profil.

**Limite** : non testable ici (pas de téléphone) ; à essayer sur un Android.

## 5. Photo de profil (appareil photo ou galerie)

**Équivalent d'`expo-image-picker`** (exercice 1). Sur téléphone, le bouton **Appareil photo** ouvre la caméra ; sur ordinateur il
ouvre le sélecteur de fichiers. L'image est recadrée en carré et réduite à 256 px **dans le navigateur** (une photo de 5 Mo devient
~20 Ko), puis enregistrée. Affichée dans la barre du haut, la liste des membres et les cartes du Kanban ; initiales à défaut.
Annuler n'est pas une erreur. **Sécurité** : le serveur ne fait pas confiance au client — liste blanche JPEG/PNG/WebP,
vérification de la **signature binaire**, taille maximale ; un SVG ou un faux PNG est refusé.

**Fichiers** : `+` `src/app/(app)/profile/avatar-uploader.tsx` · `+` `src/lib/avatar.ts`, `avatar.test.ts`, `resize-image.ts` ·
`+` `src/components/user-avatar.tsx` · `~` `src/app/(app)/profile/actions.ts`, `page.tsx`, `profile-forms.tsx` ·
`~` `members/page.tsx`, `kanban/task-card.tsx`, `services/member.service.ts`, `task.service.ts`

**Vérification** : 7 tests unitaires de validation ; e2e `profile.spec.ts` (non exécuté).

## 6. Brouillon d'ADR enregistré sur l'appareil

**Équivalent du hook `useStockage` + AsyncStorage** (séance 5). Le formulaire « Nouvel ADR » mémorise la saisie dans le
`localStorage` : si on ferme l'onglet, le brouillon est restauré avec un bouton « Effacer le brouillon ». Il est supprimé après
création. Le contenu du stockage n'est jamais cru : forme vérifiée, erreurs de stockage ignorées. Lecture par
`useSyncExternalStore` (pas d'erreur d'hydratation).

**Fichiers** : `+` `src/hooks/use-storage.ts`, `src/components/clear-draft.tsx` · `~` `adr/adr-form.tsx`, `adr/new/page.tsx`,
`adr/actions.ts`, `adr/[number]/page.tsx` · `~` `i18n/messages/adr.ts`

## 7. Recherche dans les ADR et les tâches

Champ de recherche (titre, contexte, décision, conséquences / titre, description), insensible à la casse, qui **ne traite pas
`%` et `_` comme des jokers**, combinable avec les filtres existants.

**Fichiers** : `~` `src/services/adr.service.ts`, `task.service.ts`, `adr/page.tsx`, `kanban/page.tsx`
**Vérification** : tests d'intégration (casse, `100%`, aucun résultat).

## 8. Tableau de bord complété (correction d'un manque)

Le service calculait les statistiques des tâches (par colonne, **en retard**, **ADR acceptés sans tâche liée**) mais la page ne
les affichait pas, alors que la documentation les annonçait. Elles sont affichées, avec des barres de progression.

**Fichiers** : `~` `…/[id]/dashboard/page.tsx` · `~` `i18n/messages/dashboard.ts`

## 9. Mot de passe oublié

Lien envoyé par e-mail (dans la langue de la personne), **valable 1 h, à usage unique** même sous requêtes simultanées. Le jeton
(256 bits) n'est **jamais stocké** : seule son empreinte SHA-256 l'est. La réponse est identique que le compte existe ou non
(pas d'énumération) ; limite 3 demandes par adresse et 10 par IP / 15 min. Le lien est construit avec `AUTH_URL`, jamais avec
l'en-tête `Host`. Réinitialiser débloque un compte verrouillé. Sans serveur SMTP, le lien s'affiche dans les journaux.

**Fichiers** : `+` `src/services/password-reset.service.ts` · `+` `src/lib/mail.ts`, `base-url.ts` · `+` `src/app/(auth)/forgot-password/*`,
`reset-password/[token]/*` · `~` `(auth)/actions.ts`, `login/*` · `~` `lib/rate-limit.ts`, `services/rate-limit.service.ts`,
`lib/auth.config.ts`, `lib/validators/auth.ts` · `~` `prisma/schema.prisma` (table `PasswordResetToken`) · `+` `i18n/messages/email.ts` ·
`~` `package.json` (nodemailer) · `~` `.env.example`, `.env.prod.example`, `docker-compose.prod.yml`

**Vérification** : 9 tests d'intégration (usage unique, expiré, inventé, concurrence, limites…).

## 10. RGPD : export, suppression du compte, pages légales

- **Export** (`/profile/export`) : toutes les données du compte en JSON, sans le mot de passe.
- **Suppression** : mot de passe exigé ; la ligne `User` est **anonymisée** (nom, e-mail, photo, préférences effacés, connexion
  impossible) pour garder la cohérence des ADR et de l'historique des projets partagés (« Utilisateur supprimé », traduit) ; les
  projets dont on est le seul membre sont supprimés ; **le dernier administrateur d'un projet partagé est protégé**.
  Les sessions ouvertes ailleurs sont refusées dès la requête suivante.
- **Pages** `/legal/privacy` et `/legal/notice` (3 langues), liées en pied de page. **Les passages entre crochets sont à
  compléter** (ton nom, ton établissement, ton hébergeur).

**Fichiers** : `+` `src/services/account.service.ts` · `+` `src/app/(app)/profile/export/route.ts` · `+` `src/app/session-expired/route.ts` ·
`+` `src/app/legal/privacy/page.tsx`, `notice/page.tsx` · `~` `src/lib/session.ts`, `services/audit.service.ts`, `services/user.service.ts`
(`verifyCredentials` refuse un compte supprimé) · `~` `profile/*` · `+` `i18n/messages/legal.ts`

**Vérification** : 4 tests d'intégration ; test HTTP du cycle complet (connecté → compte supprimé → redirection `/session-expired`
→ cookie effacé → reconnexion refusée) ; en base : `[deleted]`, e-mail `deleted-…@deleted.invalid`.

## 11. API REST v1 + OpenAPI

5 routes en lecture seule (`/api/v1/me`, `projects`, `projects/{id}/adrs`, `adrs/{n}`, `tasks`), **sur les mêmes services métier**
que l'interface (mêmes droits), réponses `401`/`404`/`400` en JSON, description OpenAPI 3 (`/api/v1/openapi.json`) et page
`/api-docs`. Réponses construites champ par champ : aucune colonne sensible ne peut fuiter. `404` (et non `403`) pour le projet
d'autrui.

**Fichiers** : `+` `src/app/api/v1/**/route.ts` (5 routes + `openapi.json`) · `+` `src/app/api-docs/page.tsx` ·
`+` `src/lib/api.ts`, `api-serializers.ts`, `openapi.ts`, `openapi.test.ts` · `~` `src/lib/auth.config.ts` ·
Documentation : `docs/API.md`

**Vérification** : test HTTP des 5 routes (200, 400, 401, 404, absence de `passwordHash`) ; `openapi.test.ts` ; `e2e/api.spec.ts`.

## 12. Navigation globale et accessibilité

Barre commune aux pages connectées (accueil, projets, paramètres, profil avec photo, déconnexion) ; lien « Aller au contenu
principal » ; `aria-current` sur l'onglet actif ; rôles `status`/`alert` sur les messages ; respect de « réduire les animations » ;
pied de page avec liens légaux ; `<main id="main-content">` partout.

**Fichiers** : `+` `src/app/(app)/layout.tsx` · `~` `src/app/layout.tsx`, `src/app/globals.css`, `…/[id]/project-nav.tsx`, `…/[id]/layout.tsx`

## 13. Tests

- **Unitaires** : 53 → **87**.
- **Intégration (nouveau)** : 28 tests sur une vraie base PostgreSQL, qui refusent de tourner si la base ne finit pas par `_test`.
  Ils vérifient ce qu'un test unitaire ne peut pas : numérotation concurrente, compteurs atomiques, usage unique du jeton, anonymisation.
- **Playwright** : 12 scénarios ajoutés (langue, thème, préférences multi-appareils, photo, export, suppression de compte,
  mot de passe oublié, API).

**Fichiers** : `+` `tests/integration/{setup,helpers,adr,members-tasks,auth,account}.test.ts|ts` · `+` `vitest.integration.config.mts` ·
`+` `e2e/settings.spec.ts`, `profile.spec.ts`, `api.spec.ts` · `~` `package.json` (script `test:integration`) · `~` `docs/TESTS.md`

## 14. Intégration continue, Docker, e-mails

- **GitHub Actions** : à chaque `push` — lint, types, tests unitaires, migrations, tests d'intégration, build ; puis Playwright
  (rapport conservé en cas d'échec). **Dependabot** pour les dépendances.
- `docker-compose.prod.yml` et `.env.prod.example` transmettent les variables SMTP.

**Fichiers** : `+` `.github/workflows/ci.yml`, `.github/dependabot.yml` · `~` `docker-compose.prod.yml`, `.env.example`, `.env.prod.example`

## 15. Purge des données expirées

Compteurs de connexion, jetons de réinitialisation, invitations périmées : supprimés automatiquement (une fois sur vingt environ,
déclenché par une connexion ou une demande de réinitialisation, sans tâche planifiée à gérer). Règle de minimisation du RGPD.

**Fichiers** : `+` `src/services/maintenance.service.ts` · `~` `src/lib/auth.ts`, `src/app/(auth)/actions.ts`,
`src/services/rate-limit.service.ts` · **Vérification** : 1 test d'intégration.

---

## 16. API mobile : jetons et écritures

**Pourquoi** : l'application mobile a besoin de se connecter sans cookie, et de modifier des données (déplacer une carte, créer
un ADR, envoyer une photo). Le site expose l'API depuis la partie 11, en lecture seule.

**Réalisation**

- **Connexion par jeton** (`POST /api/v1/auth/token`) : 256 bits aléatoires, préfixe `sgm_`, **valable 30 jours, stocké haché**
  (SHA-256), **révocable** (`DELETE`), 10 par utilisateur au maximum. Mêmes protections que la connexion web : limitation
  par email et par IP, **même réponse** pour un email inconnu et un mauvais mot de passe, compte supprimé refusé.
- **Écritures réservées aux jetons** : un cookie de session ne permet que de lire (`403 token_required`). Un navigateur envoie son
  cookie tout seul, y compris depuis un site malveillant (CSRF) ; un jeton, non.
- Nouvelles routes : `PATCH` de tâche (déplacement) et d'ADR (statut, mêmes règles de transition que le site), `POST` d'ADR,
  `PUT/DELETE` de la photo, `GET` d'un projet. Les erreurs métier deviennent des codes HTTP (404, 409, 422…) ; `422` liste les
  champs en cause.
- La description OpenAPI et la page `/api-docs` couvrent toutes les méthodes ; un test vérifie que chaque méthode décrite existe.

**Fichiers** : `+` `src/services/api-token.service.ts` · `+` `src/app/api/v1/auth/token/route.ts`, `me/avatar/route.ts`,
`projects/[id]/route.ts`, `projects/[id]/tasks/[taskId]/route.ts` · `~` `src/lib/api.ts` (authentification Bearer, protection
CSRF, traduction des erreurs), `src/app/api/v1/me/route.ts`, `projects/[id]/adrs/route.ts` (POST), `adrs/[number]/route.ts` (PATCH) ·
`~` `src/lib/openapi.ts`, `openapi.test.ts`, `src/app/api-docs/page.tsx` · `~` `prisma/schema.prisma`,
`+` `prisma/migrations/20261110090000_api_tokens/migration.sql` · `~` `src/services/maintenance.service.ts` (purge) ·
`+` `tests/integration/api.test.ts` · `~` `vitest.integration.config.mts` · Documentation : `docs/API.md` (réécrite), `docs/SECURITE.md`

**Vérification** : 14 tests d'intégration (jeton haché, expiré, révoqué, compte supprimé, 10 jetons maximum, droits, 404 pour un
non-membre, 409 sur transition interdite, 422 avec champs) ; test HTTP réel de la protection CSRF (cookie → lecture `200`,
écriture `403`).

## 17. Application mobile React Native (Expo) — `mobile/`

**Pourquoi** : ton sujet demande « un site sur PC comme une app sur téléphone », et la fiche de la séance 5 décrit exactement
ce qu'une app mobile doit contenir. L'application est un **client de l'API du site** : mêmes comptes, mêmes projets, mêmes droits ;
aucune logique métier dupliquée (le serveur arbitre et refuse en 409 / 422).

**Réalisation** (Expo SDK 58, Expo Router, TypeScript, structure `src/app`, `components`, `hooks`, `context`, `api`, `data`)

| Écran            | Contenu                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Connexion        | Adresse du serveur (devinée à partir de Metro), email, mot de passe ; jeton gardé dans le **coffre du système**                                                                                        |
| Projets (onglet) | `FlatList` des projets, tirer pour actualiser, 3 états (chargement / erreur / données)                                                                                                                 |
| Favoris (onglet) | ADR épinglés, enregistrés sur le téléphone (fonctionne sans réseau)                                                                                                                                    |
| Profil (onglet)  | **Photo : appareil photo ou galerie** (permission au clic, refus géré par une `Alert` vers les réglages, annulation sans erreur), langue FR/EN/DE, thème clair/sombre/système, vibrations, déconnexion |
| Projet           | ADR avec **recherche** (anti-rebond) et filtre par statut, accès au Kanban et à la création                                                                                                            |
| ADR              | Détail, **changement de statut** (règles du site, 409 affiché proprement), épingler (vibration)                                                                                                        |
| Nouvel ADR       | Formulaire, **brouillon enregistré sur le téléphone** (`useStockage`), validation puis erreurs du serveur par champ                                                                                    |
| Kanban           | Une colonne à la fois, recherche, déplacement des cartes avec **vibration**, affichage immédiat puis confirmation                                                                                      |

**Points de conception** : hook `useStockage` (équivalent du hook du cours, avec validation du contenu lu) ; `useChargement`
(3 états, réponses périmées ignorées) ; contextes `Auth`, `Favoris`, `Preferences` ; `Stack.Protected` (la déconnexion ou un 401 renvoie
seuls vers la connexion) ; client d'API sans dépendance à React, avec **erreurs typées** et délai maximal de 15 s ; traductions
typées (une traduction oubliée ne compile pas) ; zones de toucher de 48 px et rôles d'accessibilité.

**Fichiers** : `+` tout le dossier `mobile/` : `app.json`, `eas.json` (`.apk` via le profil `preview`), `package.json`, `.npmrc`,
`README.md`, `src/app/**` (8 écrans), `src/api/{client,adresse,serveur,echec}.ts`, `src/context/{auth,favoris,preferences}.tsx`,
`src/hooks/{useStockage,useChargement,useDebounce}.ts`, `src/data/{types,regles}.ts`, `src/components/*`,
`src/i18n/{index,messages}.ts`, `src/lib/{vibrations,secret}.ts`, `src/constants/theme.ts`, `eslint.config.js`, `vitest.config.mts` ·
`~` `tsconfig.json`, `eslint.config.mjs`, `.dockerignore` (le site ignore `mobile/`), `.github/workflows/ci.yml` (job mobile)

**Vérification**

| Contrôle                                                                                                                                                          | Résultat                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `tsc --noEmit`                                                                                                                                                    | sans erreur                                                            |
| `expo lint` (règles Expo et React Compiler)                                                                                                                       | sans erreur                                                            |
| 51 tests unitaires (client d'API, règles, traductions)                                                                                                            | réussis                                                                |
| **Test de contrat** : le vrai client contre le vrai serveur (connexion, recherche, création d'ADR, transition refusée, Kanban, photo, déconnexion, jeton révoqué) | réussi                                                                 |
| `expo export` Android, iOS, web (Metro)                                                                                                                           | bundles générés                                                        |
| `expo-doctor`                                                                                                                                                     | 18 contrôles sur 20 ; les 2 autres exigent l'accès aux serveurs d'Expo |

**Pas vérifié** : l'exécution sur un téléphone ou un émulateur (voir ci-dessous).

## 18. Messagerie de projet

Discussion en texte brut entre les membres d'un projet : onglet **Messagerie**, table `Message` (migration `20261117100000_messages`), `message.service.ts`, routes `GET` et `POST /api/v1/projects/{id}/messages`.

- 2000 caractères maximum, caractères interdits refusés, pas plus de 3 sauts de ligne consécutifs.
- Quota par utilisateur (15/min, 80 par fenêtre) via `consumeQuota`, requête SQL atomique.
- 50 messages conservés par projet : les plus anciens sont supprimés à l'envoi.
- Actualisation toutes les 8 s quand l'onglet est visible (`auto-refresh.tsx`).
- Traduite en FR, EN et DE (`i18n/messages/chat.ts`).

**Limites** : pas de test dédié, pas de trace d'audit, pas de description OpenAPI, pas d'écran mobile.

**Fichiers** : `+` `src/services/message.service.ts`, `src/lib/validators/chat.ts`, `src/app/(app)/projects/[id]/messages/*`, `src/app/api/v1/projects/[id]/messages/route.ts`, `prisma/migrations/20261117100000_messages` · `~` `prisma/schema.prisma`, `project-nav.tsx`

## Correspondance avec la fiche « React Native · séance 5 »

Cette fiche décrit le projet **mobile** du cours. Elle est maintenant couverte **à la lettre par l'application `mobile/`** (tableau
détaillé dans `mobile/README.md`) ; la version web garde ses équivalents (PWA).

| Attendu de la fiche                       | Équivalent dans SlamGement                                                                        | Statut |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- | :----: |
| ≥ 3 écrans, avec navigation               | **Mobile : 8 écrans** (3 onglets + pile). Web : ~15 pages                                         |   ✔    |
| Données venant d'une API                  | API REST `/api/v1` documentée (OpenAPI), données en base PostgreSQL                               |   ✔    |
| Liste `FlatList`                          | Listes d'ADR, de tâches, de membres, d'historique (pagination)                                    |   ✔    |
| Saisie de l'utilisateur                   | Formulaires, recherche, filtres                                                                   |   ✔    |
| Données enregistrées sur le téléphone     | **Mobile : `useStockage` / AsyncStorage** (favoris, brouillon, préférences). Web : `localStorage` |   ✔    |
| Fonction du téléphone (photo, vibration…) | **Mobile : `expo-image-picker` + `expo-haptics`**. Web : `capture` + API Vibration                |   ✔    |
| Code TypeScript rangé en dossiers         | `app/`, `components/`, `services/`, `lib/`, `i18n/`, `hooks/`                                     |   ✔    |
| README avec captures et mode d'emploi     | `mobile/README.md` + 11 documents ; **captures d'écran à ajouter**                                |   ◐    |
| « Générer l'.apk avec EAS »               | `mobile/eas.json` (profil `preview`, `.apk`) ; **non lancé** ; exige un site en HTTPS             |   ◐    |

## Ce qui n'a PAS été fait, et pourquoi

| Point                                                                                               | Raison                                                                                                                                     |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Exécution des tests Playwright                                                                      | Pas de navigateur dans l'environnement de travail. Les 33 scénarios sont à lancer chez toi (`npm run test:e2e`)                            |
| Construction de l'image Docker                                                                      | Pas de Docker ici. Le build `standalone` (utilisé par l'image) a été démarré et testé à la main                                            |
| **Essai de l'application mobile sur un téléphone** (Expo Go), des vibrations et de l'appareil photo | Pas de téléphone ni d'émulateur dans l'environnement de travail. Vérifié : types, lint, tests, contrat avec le vrai serveur, bundles Metro |
| Génération de l'`.apk` (EAS)                                                                        | Exige un compte Expo et un site en HTTPS (Android refuse le `http://` dans un `.apk`)                                                      |
| Glisser-déposer du Kanban                                                                           | Impossible à valider sans navigateur ; les boutons de déplacement restent, et sont accessibles au clavier                                  |
| Vérification de l'e-mail à l'inscription, 2FA                                                       | Hors périmètre raisonnable ; restent listés comme limites dans `SECURITE.md`                                                               |
| Captures d'écran, texte des pages légales                                                           | À faire par toi : ton nom, ton établissement, ton hébergeur, tes captures                                                                  |
| Relecture des traductions EN et DE                                                                  | Faites avec soin mais pas par un locuteur natif : fais relire les textes importants avant la soutenance                                    |

## À faire chez toi

1. Remplacer ton dossier par cette version, puis **supprimer** les fichiers morts revenus dans ton zip :
   `src/dashboard/`, `src/lib/roles.ts`, `src/lib/validators/rate-limit.service.ts`,
   `src/components/ui/{badge,dialog,sonner,table}.tsx`, `public/{file,globe,next,vercel,window}.svg`, `docs/DEMONSTRATION` (sans `.md`).
2. `npm install` puis `npx prisma migrate dev` (applique les 3 nouvelles migrations : compteur d'ADR, préférences / photo / réinitialisation, jetons mobiles).
3. Régénérer les secrets de ton `.env.prod` (ils étaient dans le zip envoyé) ; ne jamais le versionner.
4. `npm run test:integration` avec une base `slamgement_test` (voir `docs/TESTS.md`), puis `npm run test:e2e`.
5. **Application mobile** : suis `mobile/README.md` (site avec `npm run dev -- -H 0.0.0.0`, puis `cd mobile && npm install && npx expo start`, QR code dans Expo Go) et signale tout écran qui se comporte mal.
6. Compléter les passages entre crochets de `src/i18n/messages/legal.ts`, ajouter les captures d'écran, renseigner `docs/PLANNING.md`.

---

## Premier passage de Playwright (retour d'exécution)

Première exécution réelle des 33 scénarios (Chromium, base de test) : **24 réussis, 9 en échec**. Les 9 échecs avaient
**trois causes, toutes dans les tests ou leur interaction avec mes changements — aucune n'était un défaut de l'application** :

| Cause                                                                                                                                                                                   | Tests touchés | Correction                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: | ----------------------------------------------------------------------------------------------------------------------------- |
| **Mon changement** : après la création d'un ADR, l'URL est `…/adr/1?created=1` (le paramètre efface le brouillon local). Le helper `createAdr` attendait une URL qui finit par `/adr/1` |       6       | `e2e/helpers.ts` : le motif tolère la chaîne de requête                                                                       |
| `login()` clique sur « Se connecter » **sans attendre** la fin de la connexion ; un `goto()` immédiat l'annule. Plus visible depuis que les pages font un contrôle de session en base   |       2       | Nouveau helper `loginAndWait()` (attend la redirection vers `/projects`), utilisé dans `access.spec.ts` et `settings.spec.ts` |
| Mon test de langue cherchait le sélecteur par son étiquette « Langue », qui devient « Language » après le passage en anglais                                                            |       1       | `e2e/settings.spec.ts` : sélecteur ciblé par son identifiant                                                                  |

**Vérifié autrement avant de corriger** (serveur de production réel, requêtes directes) : un utilisateur connecté voit bien le bouton
« Rejoindre le projet » (un utilisateur non connecté voit l'invitation à se connecter, ce qui est exactement ce que le test a vu) ; l'action
des préférences enregistre langue et thème sur le compte, et un autre navigateur sans cookie les retrouve (allemand + sombre alors que le
navigateur envoyait du français).

Les 24 scénarios réussis comprennent les nouveautés : photo de profil, export RGPD, suppression de compte, mot de passe oublié, API,
changement de langue et mode sombre.

Les messages `[WebServer] ⨯ Error: The destination stream closed early` du journal apparaissent quand le navigateur annule une
requête en cours (navigation interrompue, rafraîchissement) ; ils ne font pas échouer les tests.
Les corrections ci-dessus n'ont **pas** été rejouées dans Playwright (pas de navigateur de mon côté) : relance `npm run test:e2e`.
