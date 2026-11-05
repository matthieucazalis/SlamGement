# Architecture de SlamGement

## Vue d'ensemble

Chaque requête traverse les mêmes couches. La règle d'or : les pages et les
actions serveur ne parlent **jamais** directement à la base, elles passent par
un service, et c'est le service qui contrôle les droits et journalise.

```mermaid
flowchart LR
    N[Navigateur] --> P[proxy.ts<br/>session obligatoire]
    P --> UI[Pages et composants<br/>Next.js App Router]
    UI --> SA[Server Actions<br/>et routes d'export]
    SA --> V[Validation Zod]
    V --> S[Services<br/>logique métier]
    S --> R[requireRole<br/>contrôle des droits]
    S --> A[logAction<br/>journal d'audit]
    S --> DB[(PostgreSQL<br/>via Prisma)]
    AU[Auth.js<br/>sessions JWT] -.-> P
    AU -.-> SA
```

## Diagramme de classes de la couche métier

```mermaid
classDiagram
    direction LR

    class UserService {
        +registerUser()
        +verifyCredentials()
        +updateProfile()
        +changePassword()
    }
    class ProjectService {
        +createProject()
        +listProjectsForUser()
        +getProjectForUser()
        +deleteProject()
    }
    class MemberService {
        +listMembers()
        +changeMemberRole()
        +removeMember()
    }
    class InvitationService {
        +createInvitation()
        +getInvitationByToken()
        +acceptInvitation()
    }
    class AdrService {
        +listAdrs()
        +getAdr()
        +createAdr()
        +updateAdr()
        +changeAdrStatus()
        +deleteAdr()
        +listAdrsForExport()
    }
    class TaskService {
        +listTasks()
        +listTasksByAdr()
        +createTask()
        +updateTask()
        +moveTask()
        +deleteTask()
    }
    class DashboardService {
        +getDashboard()
    }
    class AuditService {
        +logAction()
        +listAuditLogs()
        +listAuditActors()
    }
    class RateLimitService {
        +isLoginBlocked()
        +registerLoginFailure()
        +resetLoginAttempts()
    }
    class Permissions {
        <<module>>
        +requireRole()
    }
    class AdrStatusRules {
        <<module>>
        +canTransition()
        +allowedTransitions()
        +isContentEditable()
    }
    class TaskStatusRules {
        <<module>>
        +nextStatus()
        +previousStatus()
        +isOverdue()
    }

    ProjectService ..> Permissions
    MemberService ..> Permissions
    InvitationService ..> Permissions
    AdrService ..> Permissions
    TaskService ..> Permissions
    DashboardService ..> Permissions
    AuditService ..> Permissions

    ProjectService ..> AuditService : journalise
    MemberService ..> AuditService : journalise
    InvitationService ..> AuditService : journalise
    AdrService ..> AuditService : journalise
    TaskService ..> AuditService : journalise

    AdrService ..> AdrStatusRules
    TaskService ..> TaskStatusRules
```

## Modèle de données

Le modèle relationnel est dans `prisma/schema.prisma`. Les tables : `User`,
`Project`, `Membership` (rôle par projet), `Invitation`, `Adr`, `Task`,
`AuditLog`, `RateLimit`.

## Décisions d'architecture (les ADR du projet lui-même)

| Décision                                                                     | Raison                                                                                                  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Règles métier dans des modules sans dépendance (`adr-status`, `task-status`) | Testables seules, réutilisées par l'interface et les services                                           |
| Contrôle des droits dans les services, jamais seulement dans l'interface     | Cacher un bouton ne protège rien                                                                        |
| Action et trace d'audit dans la même transaction                             | Jamais de changement sans trace                                                                         |
| Pas d'adaptateur Prisma pour Auth.js, sessions JWT                           | Notre modèle `User` porte déjà `passwordHash` ; le fournisseur Credentials impose le JWT                |
| Markdown sans HTML brut, Mermaid en mode strict                              | Protection contre le XSS                                                                                |
| Service worker limité à la page hors ligne                                   | Aucune donnée privée stockée sur l'appareil                                                             |
| Compteur `adrCounter` par projet, incrémenté atomiquement                    | Un numéro d'ADR n'est jamais réattribué après suppression : les fichiers `.md` exportés restent valides |
| Fuseau `Europe/Paris` fixé à l'affichage (`lib/format.ts`)                   | Le serveur est en UTC : sans cela, les heures affichées auraient 1 à 2 h de décalage                    |
| Polices servies par le paquet `geist`                                        | Aucun appel à Google Fonts au build ni à l'exécution (build reproductible, pas de transfert d'IP)       |
