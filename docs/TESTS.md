# Tests de SlamGement

## 1. Stratégie

| Niveau       | Outil      | Ce que ça vérifie                                                                                | Quand                                                             |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Unitaire     | Vitest     | Les règles métier pures (statuts, export, libellés d'audit, limitation)                          | À chaque modification, en quelques secondes, sans base de données |
| Bout en bout | Playwright | Les parcours complets dans un vrai navigateur, sur le **build de production** et une base dédiée | Avant chaque fusion dans `dev`                                    |
| Manuel       | Navigateur | L'exploration, les contrôles visuels, les tentatives d'attaque                                   | À chaque fin de phase                                             |

Le principe : une règle métier est **isolée dans un module sans dépendance**
(par exemple `adr-status.ts`) pour pouvoir être testée seule, puis les
parcours de bout en bout vérifient que l'ensemble tient.

## 2. Lancer les tests

```bash
npx tsc --noEmit        # types
npm test                # tests unitaires
npm run test:e2e        # tests de bout en bout
npm run test:e2e:report # rapport HTML détaillé (captures, trace pas à pas)
```

### Préparer la base de test (une seule fois)

Les tests de bout en bout utilisent une base **séparée** (`slamgement_test`)
pour ne jamais toucher aux données de développement. Docker doit tourner.

```bash
docker compose exec db psql -U slamgement -d slamgement -c "CREATE DATABASE slamgement_test;"
DATABASE_URL="postgresql://slamgement:slamgement_dev@localhost:5432/slamgement_test" npx prisma migrate deploy
docker compose exec db psql -U slamgement -d slamgement_test -c "\dt"
```

La sortie de `migrate deploy` doit afficher `PostgreSQL database "slamgement_test"`,
et la commande `\dt` doit lister les tables. **Ne jamais lancer le test sans
avoir vérifié ce dernier point** (voir « Incidents », plus bas).

Pour repartir d'une base de test vide (le nom de la base est écrit en toutes
lettres : la base de développement n'est pas concernée) :

```bash
docker compose exec db psql -U slamgement -d slamgement -c "DROP DATABASE slamgement_test;"
docker compose exec db psql -U slamgement -d slamgement -c "CREATE DATABASE slamgement_test;"
```

puis relancer `migrate deploy` comme ci-dessus.

### Fonctionnement des tests de bout en bout

- Playwright **construit** l'application (`npm run build`) puis la lance sur le
  port 3100 avec la base de test. On teste donc ce qui sera déployé, y compris
  la Content Security Policy stricte, plus permissive en mode développement.
- Un seul navigateur (Chromium), un seul processus : les tests s'exécutent à la suite.
- Chaque test crée ses propres comptes avec des emails uniques : ils ne se gênent pas.
- Une première exécution dure 2 à 3 minutes (construction comprise).

## 3. Tests unitaires

| Fichier                 | Ce qui est vérifié                                                                                                                                                                                                      | Tests  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `adr-status.test.ts`    | Les 5 transitions autorisées ; transitions interdites ; aucun changement vers le même statut ; **les 25 couples de statuts** contre la table ; états finaux ; ADR modifiable seulement en « Proposé »                   | 12     |
| `adr-markdown.test.ts`  | Nom de fichier (accents, ponctuation, numéro sur 4 chiffres) ; contenu de l'export ; sections facultatives omises ; bloc Mermaid ; clôture allongée si le code contient déjà des accents graves ; liens de remplacement | 9      |
| `audit-labels.test.ts`  | Phrases d'historique (changement de statut, remplacement, champs modifiés, tâches) ; **métadonnées absentes ou invalides sans plantage** ; action inconnue                                                              | 7      |
| `task-status.test.ts`   | Avancer et reculer entre colonnes ; bornes ; tâche en retard (échéance passée, jour même, future, terminée, sans échéance)                                                                                              | 8      |
| `rate-limit.test.ts`    | Fenêtre de 15 minutes active ou expirée ; seuil atteint ; normalisation de l'adresse IP (liste, IPv6, valeur invalide)                                                                                                  | 6      |
| `format.test.ts`        | Minuit à l'heure de Paris en hiver et en été, passage à l'heure d'été, date de fin incluse, dates invalides ; affichage en heure de Paris quel que soit le fuseau du serveur                                            |        |
| `safe-redirect.test.ts` | Redirection après connexion : chemin interne accepté, URL absolue réduite à son chemin, `//site`, `\\site` et `javascript:` refusés, pas de boucle vers `/login`                                                        |        |
| **Total**               |                                                                                                                                                                                                                         | **53** |

Dernière exécution : [à compléter : date, nombre de tests, durée].

## 4. Tests de bout en bout

| #   | Fichier              | Scénario                                                                                   | Risque couvert                    | Stories        |
| --- | -------------------- | ------------------------------------------------------------------------------------------ | --------------------------------- | -------------- |
| 1   | `auth.spec.ts`       | Une page protégée renvoie vers la connexion                                                | Accès sans session                | US2            |
| 2   | `auth.spec.ts`       | Inscription, connexion, déconnexion, session bien terminée                                 | Parcours d'authentification       | US1, US2       |
| 3   | `auth.spec.ts`       | Mauvais mot de passe : message neutre                                                      | Énumération de comptes            | US2            |
| 4   | `auth.spec.ts`       | Email inconnu : même message                                                               | Énumération de comptes            | US2            |
| 5   | `auth.spec.ts`       | Email déjà utilisé refusé                                                                  | Unicité du compte                 | US1            |
| 6   | `auth.spec.ts`       | 5 échecs puis blocage, même avec le bon mot de passe                                       | Force brute                       | US2            |
| 7   | `adr.spec.ts`        | Numérotation 0001 puis 0002, acceptation, verrouillage, URL d'édition forcée               | Règles de statut, intégrité       | US7, US8       |
| 8   | `adr.spec.ts`        | Contenu malveillant : ni script, ni image, ni lien `javascript:`, aucune boîte de dialogue | XSS (injection)                   | US12           |
| 9   | `adr.spec.ts`        | Schéma Mermaid affiché, aucune violation de la CSP                                         | Rendu sécurisé en production      | US12           |
| 10  | `access.spec.ts`     | Un non-membre reçoit une **404 sur 9 chemins** du projet                                   | Contrôle d'accès, IDOR            | US4 à US11     |
| 11  | `access.spec.ts`     | Un visiteur non connecté est renvoyé vers la connexion                                     | Accès sans session                | US2            |
| 12  | `access.spec.ts`     | Invitation : droits limités du membre, historique en 404, lien à usage unique              | RBAC, jeton à usage unique        | US5, US6, US11 |
| 13  | `kanban.spec.ts`     | Créer une tâche, la lier à un ADR, la déplacer, la retrouver côté ADR                      | Parcours complet tâche ↔ décision | US15 à US17    |
| 14  | `pwa.spec.ts`        | Le manifeste est public (sans redirection) et complet                                      | Installabilité                    | —              |
| 15  | `pwa.spec.ts`        | Les 4 icônes sont des PNG publics                                                          | Installabilité                    | —              |
| 16  | `pwa.spec.ts`        | Une icône inconnue donne une 404                                                           | Robustesse                        | —              |
| 17  | `pwa.spec.ts`        | Service worker et page hors ligne publics, `Cache-Control` du service worker               | Configuration                     | —              |
| 18  | `pwa.spec.ts`        | Le service worker s'enregistre dans le navigateur                                          | Installabilité                    | —              |
| 19  | `responsive.spec.ts` | Pages publiques à 375 px sans défilement horizontal                                        | Responsive                        | —              |
| 20  | `responsive.spec.ts` | Toutes les pages d'un projet à 375 px, ADR avec schéma large compris                       | Responsive                        | —              |
| 21  | `responsive.spec.ts` | La navigation du projet est utilisable au téléphone                                        | Responsive                        | —              |

Dernière exécution : [à compléter : date, 21 tests, durée].

## 5. Tests manuels

À jouer sur le jeu de démonstration (`npm run db:seed`) ou sur des données
neuves. Cocher chaque ligne à la fin de la phase concernée.

### A. Authentification et profil (US1 à US3)

| #   | Scénario                                                         | Résultat attendu                                                          | OK  |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- | --- |
| A1  | Inscription avec un mot de passe de 3 caractères                 | Refus, message d'erreur                                                   | ☐   |
| A2  | Inscription valide                                               | Redirection vers la connexion ; en base, `passwordHash` commence par `$2` | ☐   |
| A3  | Connecté, ouvrir `/login`                                        | Redirection vers `/projects`                                              | ☐   |
| A4  | Modifier son nom                                                 | Message de succès, valeur conservée après rechargement                    | ☐   |
| A5  | Changer de mot de passe avec un faux mot de passe actuel         | « Mot de passe actuel incorrect »                                         | ☐   |
| A6  | Confirmation différente du nouveau mot de passe                  | Message d'erreur                                                          | ☐   |
| A7  | Changement valide, puis reconnexion avec le nouveau mot de passe | Connexion réussie                                                         | ☐   |
| A8  | Déconnecté, ouvrir `/profile`                                    | Redirection vers `/login`                                                 | ☐   |
| A9  | Se déconnecter puis utiliser le bouton « retour » du navigateur  | Accès toujours bloqué                                                     | ☐   |

### B. Projets, invitations, rôles (US4 à US6, US9)

| #   | Scénario                                            | Résultat attendu                                                                  | OK  |
| --- | --------------------------------------------------- | --------------------------------------------------------------------------------- | --- |
| B1  | Créer un projet                                     | Rôle `ADMIN` ; en base : `Project`, `Membership`, trace `PROJECT_CREATED`         | ☐   |
| B2  | Ouvrir `/projects/nimportequoi`                     | 404                                                                               | ☐   |
| B3  | Un autre compte ouvre l'URL de mon projet           | **404** (contrôle d'accès)                                                        | ☐   |
| B4  | Créer une invitation                                | Lien affiché une seule fois ; en base, `tokenHash` est différent du jeton du lien | ☐   |
| B5  | Invité non connecté ouvre le lien                   | Nom du projet et demande de connexion                                             | ☐   |
| B6  | Invité connecté accepte                             | Rôle attribué, trace `MEMBER_JOINED`                                              | ☐   |
| B7  | Rouvrir le même lien                                | « Invalide ou expiré »                                                            | ☐   |
| B8  | Un compte portant un autre email ouvre le lien      | Message : invitation destinée à une autre adresse                                 | ☐   |
| B9  | Connecté en membre, page Membres                    | Pas de formulaire d'invitation                                                    | ☐   |
| B10 | L'admin change un rôle                              | Liste à jour ; trace avec ancien et nouveau rôle                                  | ☐   |
| B11 | Le seul admin tente de se rétrograder ou de quitter | Refus : au moins un administrateur                                                | ☐   |
| B12 | Un membre clique « Quitter »                        | Retour sur `/projects`, projet disparu de sa liste                                | ☐   |
| B13 | Supprimer le projet : mauvais nom, puis bon nom     | Refus, puis suppression ; trace `PROJECT_DELETED` conservée avec `projectId` vide | ☐   |
| B14 | Connecté en membre                                  | Zone dangereuse absente                                                           | ☐   |

### C. Décisions d'architecture (US7 à US9)

| #   | Scénario                                                                     | Résultat attendu                                                   | OK  |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ | --- |
| C1  | Contexte de moins de 10 caractères                                           | Erreur, saisie conservée                                           | ☐   |
| C2  | Créer deux ADR                                                               | `ADR-0001` puis `ADR-0002`                                         | ☐   |
| C3  | Proposé → Accepté                                                            | Badge vert, trace avec `from` et `to`, bouton « Modifier » disparu | ☐   |
| C4  | Ouvrir à la main l'URL d'édition d'un ADR accepté                            | Redirection avec message « n'est plus modifiable »                 | ☐   |
| C5  | Rejeté → Accepté                                                             | Aucun bouton ; le serveur refuserait aussi                         | ☐   |
| C6  | Accepté → Remplacé par un ADR existant                                       | Lien dans les deux sens ; plus aucune transition                   | ☐   |
| C7  | Remplacement par soi-même, par un ADR rejeté, ou déjà utilisé                | Refusé                                                             | ☐   |
| C8  | Filtre par statut dans la liste                                              | Seuls les ADR de ce statut                                         | ☐   |
| C9  | Suppression : par un membre, par un admin, d'un ADR qui en remplace un autre | Impossible, possible avec la case cochée, refusée                  | ☐   |
| C10 | Supprimer un ADR lié à une tâche                                             | La tâche reste, sans lien                                          | ☐   |

### D. Rendu, export et contenu malveillant (US10, US12, US13)

| #   | Scénario                                                                                       | Résultat attendu                                                 | OK  |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --- |
| D1  | Saisir du Markdown dans le formulaire                                                          | L'aperçu à droite suit la frappe                                 | ☐   |
| D2  | Schéma Mermaid valide, puis invalide                                                           | Schéma dessiné ; message « Schéma invalide » sans casser la page | ☐   |
| D3  | Export `.md` d'un ADR                                                                          | Titre, statut, date, sections, bloc `mermaid`                    | ☐   |
| D4  | Export ZIP                                                                                     | Un fichier par ADR, liens de remplacement entre fichiers         | ☐   |
| D5  | Déposer un `.md` sur GitHub                                                                    | Le schéma s'affiche                                              | ☐   |
| D6  | Dans un ADR : `<script>`, `<img onerror>`, lien `javascript:`, image distante, `click` Mermaid | Aucune exécution, aucune image distante                          | ☐   |

### E. Kanban (US15 à US17)

| #   | Scénario                                             | Résultat attendu                                                                     | OK  |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ | --- |
| E1  | Créer une tâche ; titre d'un caractère               | Carte en « À faire » ; erreur avec saisie conservée                                  | ☐   |
| E2  | Boutons de colonne                                   | Pas de ← en « À faire », pas de → en « Terminé »                                     | ☐   |
| E3  | Filtres membre, « non assignées », colonne           | Résultats cohérents, filtres partageables par l'URL                                  | ☐   |
| E4  | Échéance : hier, aujourd'hui, tâche terminée         | En retard en rouge ; pas en retard ; pas en retard ; le jour affiché est celui saisi | ☐   |
| E5  | Description avec Markdown et `<script>`              | Mise en forme rendue ; aucune exécution                                              | ☐   |
| E6  | Modifier puis supprimer une tâche                    | Modifications visibles ; suppression avec case cochée                                | ☐   |
| E7  | Assignation à un non-membre (valeur forgée avec F12) | « Cette personne n'est pas membre du projet »                                        | ☐   |
| E8  | Lien vers l'ADR d'un autre projet (valeur forgée)    | « Cet ADR n'existe pas dans ce projet »                                              | ☐   |
| E9  | Ouvrir une tâche d'un autre projet par son URL       | 404                                                                                  | ☐   |
| E10 | Lier puis délier une tâche et un ADR                 | Visible dans les deux sens                                                           | ☐   |

### F. Historique et tableau de bord (US11, US14)

| #   | Scénario                                             | Résultat attendu                                                                     | OK  |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ | --- |
| F1  | Historique en admin                                  | Phrases lisibles (« a fait passer ADR-0001 de Proposé à Accepté »)                   | ☐   |
| F2  | Filtres action, utilisateur, dates                   | Résultats filtrés ; date de fin incluse                                              | ☐   |
| F3  | URL avec paramètres invalides (`?action=x&page=abc`) | Page affichée, filtre ignoré                                                         | ☐   |
| F4  | Pagination (taille de page réduite à 3 pour l'essai) | Précédent et suivant fonctionnent                                                    | ☐   |
| F5  | Connecté en membre                                   | Lien « Historique » absent, URL directe : 404                                        | ☐   |
| F6  | Tableau de bord                                      | Compteurs cohérents avec les listes ; barres modifiées après un changement de statut | ☐   |
| F7  | Tâche non terminée avec échéance passée              | « En retard » à 1 en rouge, puis 0 une fois terminée                                 | ☐   |
| F8  | ADR accepté sans tâche                               | Listé, puis retiré après liaison d'une tâche                                         | ☐   |
| F9  | Activité récente en membre                           | Aucune ligne « a invité … »                                                          | ☐   |

### G. Sécurité transversale

| #   | Scénario                                                         | Résultat attendu                                                      | OK  |
| --- | ---------------------------------------------------------------- | --------------------------------------------------------------------- | --- |
| G1  | 5 mauvais mots de passe, puis le bon                             | Blocage ; ligne dans `RateLimit` ; un succès remet le compteur à zéro | ☐   |
| G2  | `curl -I http://localhost:3100/login` sur le build de production | En-têtes de sécurité présents                                         | ☐   |
| G3  | Parcours complet avec la console ouverte                         | Aucune violation de la CSP                                            | ☐   |
| G4  | `npm audit --omit=dev`                                           | Alertes triées et documentées dans `SECURITE.md`                      | ☐   |
| G5  | `git ls-files` et `git check-ignore -v .env .env.prod`           | Aucun fichier de secrets suivi par Git                                | ☐   |

### H. Responsive et PWA

| #   | Scénario                                             | Résultat attendu                       | OK  |
| --- | ---------------------------------------------------- | -------------------------------------- | --- |
| H1  | Toutes les pages à 375 px (mode appareil mobile)     | Aucun défilement horizontal de la page | ☐   |
| H2  | Navigation du projet à 375 px                        | Barre défilante, page courante repérée | ☐   |
| H3  | Chrome, onglet Application, Manifest                 | Aucune erreur, 3 icônes                | ☐   |
| H4  | Service worker activé, cocher « Offline », recharger | Page « Tu es hors ligne »              | ☐   |
| H5  | Installer l'application sur ordinateur               | Fenêtre dédiée                         | ☐   |
| H6  | Installer sur téléphone, après déploiement en HTTPS  | Icône sur l'écran d'accueil            | ☐   |

## 6. Traçabilité : stories → tests

| Story                        | Unitaire       | Bout en bout      | Manuel         |
| ---------------------------- | -------------- | ----------------- | -------------- |
| US1 Inscription              | —              | 2, 5              | A1, A2         |
| US2 Connexion                | `rate-limit`   | 1, 2, 3, 4, 6, 11 | A3, A8, A9, G1 |
| US3 Profil                   | —              | —                 | A4 à A7        |
| US4 Créer un projet          | —              | 10                | B1 à B3        |
| US5 Inviter                  | —              | 12                | B4 à B9        |
| US6 Rôles et retrait         | —              | 12                | B10 à B12      |
| US7 Créer et modifier un ADR | `adr-status`   | 7                 | C1, C2, C4     |
| US8 Statuts                  | `adr-status`   | 7                 | C3, C5 à C7    |
| US9 Suppressions             | —              | —                 | B13, C9, C10   |
| US10 Export `.md`            | `adr-markdown` | —                 | D3, D5         |
| US11 Historique              | `audit-labels` | 12                | F1 à F5        |
| US12 Markdown et Mermaid     | —              | 8, 9              | D1, D2, D6     |
| US13 Export ZIP              | `adr-markdown` | —                 | D4             |
| US14 Tableau de bord         | —              | —                 | F6 à F9        |
| US15 à US17 Kanban           | `task-status`  | 13                | E1 à E10       |

## 7. Ce que les tests ne couvrent pas

- Un seul navigateur (Chromium) ; pas de test sous Firefox ni Safari.
- Pas de test de charge : le comportement avec de nombreux utilisateurs simultanés n'est pas mesuré.
- Pas d'audit d'accessibilité automatisé (contrastes, lecteur d'écran) ; seuls les libellés de champs et le texte à côté des couleurs ont été soignés.
- Le **contenu** des fichiers exportés (`.md`, ZIP) est vérifié par les tests unitaires et en manuel, pas par un téléchargement automatisé.
- Les accès simultanés ne sont pas testés : numérotation d'ADR, règle du dernier administrateur et modification d'une même tâche par deux personnes reposent sur des protections décrites mais non éprouvées sous charge.
- L'installation de la PWA sur téléphone nécessite un déploiement en HTTPS.

## 8. Incidents rencontrés et enseignements

| Incident                                            | Cause                                                                               | Enseignement                                                                                             |
| --------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 12 tests sur 13 en échec, tous à 45 secondes        | Base de test créée mais **jamais migrée** : chaque action touchant la base plantait | Vérifier `\dt` avant de lancer ; essayer **un seul test** avec `--max-failures=1` avant la suite entière |
| Tests unitaires incapables de charger `@/lib/...`   | Vitest ne lit pas l'alias de `tsconfig.json`                                        | Déclarer l'alias dans `vitest.config.mts`                                                                |
| Manifeste et service worker redirigés vers `/login` | Le proxy d'authentification s'appliquait à tous les chemins                         | Exclure les fichiers PWA du proxy ; test sans session qui l'aurait détecté                               |
| CSP non éprouvée en mode développement              | La politique de développement autorise `unsafe-eval`                                | Tester sur le **build de production**                                                                    |
| Fichiers collés au mauvais endroit                  | Plusieurs fichiers portent le même nom (`actions.ts`)                               | `npx tsc --noEmit` avant chaque commit                                                                   |

## 9. Avant chaque fusion

```bash
npm run lint
npx tsc --noEmit
npm test
npm run test:e2e
npm run build
```
