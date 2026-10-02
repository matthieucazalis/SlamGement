# Planning SlamGement

```mermaid
gantt
    title Planning SlamGement
    dateFormat YYYY-MM-DD
    axisFormat %d/%m
    excludes weekends

    section Conception
    P0 Cadrage, MCD, UML, maquettes   :p0, 2026-10-05, 14d

    section Socle
    P1 Socle technique                :p1, after p0, 7d
    P2 Authentification               :p2, after p1, 7d

    section MVP
    P3 Projets, rôles, audit          :p3, after p2, 10d
    P4 Module ADR                     :p4, after p3, 14d
    P5 Export et Mermaid              :p5, after p4, 7d
    P6 Historique et dashboard        :p6, after p5, 7d
    Jalon 1 : MVP complet             :milestone, m1, after p6, 0d

    section Extensions
    P7 Kanban                         :p7, after p6, 10d
    P8 Liaison Kanban et ADR          :p8, after p7, 4d
    Jalon 2 : gel des fonctionnalités :milestone, m2, after p8, 0d

    section Finalisation
    P9 Tests, sécurité, responsive    :p9, after p8, 10d
    P10 Déploiement et dossier        :p10, after p9, 10d
    Jalon 3 : rendu et soutenance     :milestone, m3, after p10, 0d
```

## Jalons

| Jalon                        | Critère de validation                                                        | Tag Git    |
| ---------------------------- | ---------------------------------------------------------------------------- | ---------- |
| J1 : MVP complet             | Auth, projets, rôles, ADR avec statuts, export `.md`, audit log fonctionnels | `v0.1-mvp` |
| J2 : gel des fonctionnalités | Kanban terminé, plus aucune nouvelle fonctionnalité                          | `v0.2-gel` |
| J3 : rendu                   | Application déployée, dossier complet, démo répétée                          | `v1.0`     |

## Suivi réel

| Phase | Prévu  | Réel | Remarques |
| ----- | ------ | ---- | --------- |
| P0    | 2 sem. |      |           |
