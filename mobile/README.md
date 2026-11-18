# SlamGement Mobile

Application mobile (React Native + Expo) de **SlamGement**, l'outil de gestion de projet et de décisions d'architecture (ADR).
Elle se connecte au serveur du site (Next.js) par son **API REST** (`/api/v1`) : mêmes comptes, mêmes projets, mêmes droits.

> Projet de fin d'année BTS SIO SLAM — partie « application téléphone ». Le site web est dans le dossier parent.

## Ce que fait l'application

| Écran                | Rôle                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Connexion**        | Adresse du serveur, email, mot de passe. Le jeton reçu est gardé dans le coffre sécurisé du téléphone       |
| **Projets** (onglet) | Liste de mes projets (`FlatList`), tirer pour actualiser                                                    |
| **Favoris** (onglet) | ADR épinglés : enregistrés sur le téléphone, consultables sans réseau                                       |
| **Profil** (onglet)  | **Photo** (appareil photo ou galerie), langue FR/EN/DE, thème clair/sombre/système, vibrations, déconnexion |
| **Projet**           | Liste des ADR avec **recherche** et filtre par statut                                                       |
| **ADR**              | Détail, changement de statut (règles du site), épingler                                                     |
| **Nouvel ADR**       | Formulaire avec **brouillon enregistré sur le téléphone**                                                   |
| **Kanban**           | Une colonne à la fois, recherche, déplacement des cartes avec **vibration**                                 |

## Lancer le projet

Trois choses doivent tourner : la base de données, le site (qui sert l'API), puis l'application.

```bash
# 1. À la racine du dépôt : base de données et site, visible sur le réseau
docker compose up -d
npm install && npx prisma migrate dev && npm run db:seed
npm run dev -- -H 0.0.0.0          # le site écoute sur toutes les interfaces (port 3000)

# 2. Dans ce dossier (mobile/) : l'application
cd mobile
npm install
npx expo start
```

`npx expo start` affiche un **QR code** :

- **Android** : ouvre l'application **Expo Go** et scanne le QR code.
- **iPhone** : scanne le QR code avec l'appareil photo, qui ouvre Expo Go.
- Le téléphone et l'ordinateur doivent être sur le **même Wi-Fi** (sinon `npx expo start --tunnel`).
- Windows : si le pare-feu demande une autorisation pour `node.js`, accepte-la sur les réseaux privés.

**Comptes de démonstration** (après `npm run db:seed`) : `alice@slamgement.test` (administratrice),
`bruno@slamgement.test`, `chloe@slamgement.test` — mot de passe `Demo-SlamGement-1`.

**Adresse du serveur** : l'application la devine à partir de l'adresse de Metro (ton ordinateur, port 3000).
Si ce n'est pas la bonne, tape-la sur l'écran de connexion (ex. `192.168.1.42:3000`), ou définis
`EXPO_PUBLIC_API_URL` (voir `.env.example`).

## Structure

```
src/
├─ app/          Les écrans : un fichier = un écran (Expo Router)
│  ├─ _layout.tsx        Fournisseurs (préférences, session, favoris) + pile de navigation protégée
│  ├─ connexion.tsx
│  ├─ (tabs)/            Onglets : index (projets), favoris, profil
│  └─ projet/[id]/       index (ADR), kanban, adr/[numero], adr/nouveau
├─ api/          client.ts (appels fetch + erreurs typées), adresse.ts, serveur.ts
├─ context/      auth, favoris, préférences (comme FavorisProvider en cours)
├─ hooks/        useStockage (AsyncStorage), useChargement (3 états), useDebounce
├─ data/         types.ts (types de l'API), regles.ts (règles métier côté téléphone)
├─ components/   Bouton, Carte, ChampTexte, Avatar, Pastille, Etats…
├─ i18n/         Traductions français / anglais / allemand
├─ lib/          vibrations.ts (expo-haptics), secret.ts (coffre sécurisé)
└─ constants/    theme.ts (couleurs clair / sombre)
```

## Correspondance avec la fiche « séance 5 »

| Attendu                                          | Dans l'application                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| ≥ 3 écrans, avec navigation (onglets et/ou pile) | 8 écrans : 3 onglets + une pile (projet, ADR, nouvel ADR, Kanban) + connexion           |
| Données venant d'une API                         | API REST du serveur (`src/api/client.ts`), types dans `src/data/types.ts`               |
| Une liste avec `FlatList`                        | Projets, ADR, tâches, favoris                                                           |
| Une saisie de l'utilisateur                      | Recherche (ADR, tâches), formulaire d'ADR, connexion                                    |
| Données enregistrées sur le téléphone            | `useStockage` : favoris, brouillon d'ADR, langue, thème, vibrations, adresse du serveur |
| Une fonction du téléphone                        | **Appareil photo / galerie** (`expo-image-picker`) et **vibrations** (`expo-haptics`)   |
| Permission demandée au bon moment, refus géré    | Appareil photo demandé au clic ; refus → `Alert` avec bouton vers les réglages          |
| Annuler n'est pas une erreur                     | `if (!resultat.canceled)` avant de lire `assets`                                        |
| 3 états : chargement, erreur, données            | `useChargement` + `Etats.tsx`                                                           |
| Route dynamique, paramètre = texte               | `[id]`, `[numero]` lus avec `useLocalSearchParams`, convertis par `lireNumero`          |
| Contexte partagé                                 | `FavorisProvider`, `AuthProvider`, `PreferencesProvider`                                |
| TypeScript rangé en dossiers                     | voir « Structure »                                                                      |
| README                                           | ce fichier (**les captures d'écran sont à ajouter**, voir ci-dessous)                   |

## Sécurité

- Connexion par **jeton révocable** (30 jours), jamais le mot de passe : la déconnexion le révoque **côté serveur**.
- Le jeton est stocké dans le **coffre du système** (`expo-secure-store` : Keychain iOS / Keystore Android),
  pas dans `AsyncStorage` qui n'est pas chiffré.
- Le serveur reste l'arbitre : droits, transitions de statut et validation sont revérifiés pour chaque requête.
- Une session expirée (401) renvoie automatiquement vers l'écran de connexion.
- Les écritures de l'API **exigent un jeton** (un cookie de navigateur est refusé : protection CSRF).

## Tests

```bash
npm run typecheck      # TypeScript
npm run lint           # ESLint (règles Expo)
npm test               # 51 tests : client d'API, règles métier, traductions
```

**Test de contrat** (le vrai client contre un vrai serveur, base de démonstration) :

```bash
SLAM_API_URL=http://localhost:3000 SLAM_EMAIL=alice@slamgement.test \
SLAM_PASSWORD=Demo-SlamGement-1 npm test
```

Il déroule : mauvais mot de passe, connexion, lecture, recherche, création d'ADR (invalide puis valide), transition autorisée
puis interdite, déplacement Kanban, photo valide puis faux fichier, déconnexion et révocation du jeton.

## Installer l'application sans Expo Go (fichier `.apk`)

```bash
npm install -g eas-cli
eas login                                   # compte gratuit sur expo.dev
eas build -p android --profile preview      # profil « preview » : fichier .apk (voir eas.json)
```

Ouvre le lien ou le QR code affiché sur un téléphone Android, puis autorise les « sources inconnues ».
⚠️ Un `.apk` **n'accepte pas** un serveur en `http://` (Android bloque le trafic non chiffré) : il lui faut un site en
**HTTPS** (voir `docs/DEPLOIEMENT.md` du dépôt). Dans Expo Go, le `http://` du réseau local fonctionne.

## Dépannage

| Symptôme                                                        | Solution                                                                                                                    |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| « Impossible de joindre le serveur » / `Network request failed` | Même Wi-Fi ? Site lancé avec `-H 0.0.0.0` ? Adresse correcte ? Pare-feu ? Sinon `npx expo start --tunnel`                   |
| Un changement ne s'affiche pas                                  | `r` dans le terminal, ou `npx expo start -c` (vide le cache de Metro)                                                       |
| Module natif introuvable, plantage au lancement                 | `npx expo install --fix`                                                                                                    |
| Je ne sais pas d'où vient le problème                           | `npx expo-doctor`                                                                                                           |
| Les vibrations ne font rien                                     | Normal dans le navigateur et sur le simulateur ; essaie sur un vrai téléphone, option « Vibrations » activée dans le Profil |
| `npm install` échoue avec « edgesOut »                          | Le fichier `.npmrc` du dossier règle le problème ; mets npm à jour sinon                                                    |

## Captures d'écran

À ajouter dans `docs/captures/` puis à lister ici : connexion, projets, ADR, Kanban, profil (clair et sombre).

## Limites connues

- Application en **lecture et édition légère** : pas de création de projet, d'invitation de membres, de tâche ni de suppression
  (c'est le rôle du site).
- Pas de mode hors ligne complet : seuls les favoris et les préférences sont consultables sans réseau.
- Non testée sur un vrai téléphone dans l'environnement de développement de ce projet : les vérifications faites sont
  la compilation TypeScript, le lint, les tests unitaires, le test de contrat contre le serveur réel, et la génération des
  bundles Android, iOS et web avec Metro.
