// Types TypeScript des données renvoyées par l'API SlamGement (voir docs/API.md
// à la racine du dépôt, ou /api-docs sur le serveur).
export const STATUTS_ADR = [
  "PROPOSED",
  "ACCEPTED",
  "REJECTED",
  "DEPRECATED",
  "SUPERSEDED",
] as const;
export type StatutAdr = (typeof STATUTS_ADR)[number];

export const STATUTS_TACHE = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;
export type StatutTache = (typeof STATUTS_TACHE)[number];

export type Role = "ADMIN" | "MEMBER";

export type Utilisateur = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt?: string;
};

export type ReponseConnexion = {
  token: string;
  expiresAt: string;
  user: Utilisateur;
};

export type Projet = {
  id: string;
  name: string;
  description: string | null;
  role: Role;
};

export type ResumeAdr = {
  number: number;
  title: string;
  status: StatutAdr;
  author: string;
  createdAt: string;
  updatedAt: string;
};

export type Adr = ResumeAdr & {
  context: string;
  decision: string;
  consequences: string;
  alternatives: string | null;
  mermaidCode: string | null;
  supersededBy: number | null;
  supersedes: number | null;
};

export type NouvelAdr = {
  title: string;
  context: string;
  decision: string;
  consequences: string;
  alternatives?: string;
};

export type Tache = {
  id: string;
  title: string;
  description: string | null;
  status: StatutTache;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
  adrNumber: number | null;
};

export type Message = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string };
  mine: boolean;
};
