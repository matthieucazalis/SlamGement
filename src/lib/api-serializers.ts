// Représentations publiques : on liste explicitement les champs exposés (jamais
// d'objet Prisma brut, pour ne pas laisser échapper une colonne sensible).
type AdrLike = {
  number: number;
  title: string;
  status: string;
  context: string;
  decision: string;
  consequences: string;
  alternatives: string | null;
  mermaidCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string };
  supersededBy?: { number: number } | null;
  supersedes?: { number: number } | null;
};

export const serializeAdrSummary = (adr: AdrLike) => ({
  number: adr.number,
  title: adr.title,
  status: adr.status,
  author: adr.author.name,
  createdAt: adr.createdAt,
  updatedAt: adr.updatedAt,
});

export const serializeAdr = (adr: AdrLike) => ({
  ...serializeAdrSummary(adr),
  context: adr.context,
  decision: adr.decision,
  consequences: adr.consequences,
  alternatives: adr.alternatives,
  mermaidCode: adr.mermaidCode,
  supersededBy: adr.supersededBy?.number ?? null,
  supersedes: adr.supersedes?.number ?? null,
});

type TaskLike = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  assignee: { id: string; name: string } | null;
  adr: { number: number } | null;
};

export const serializeTask = (task: TaskLike) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  dueDate: task.dueDate,
  assignee: task.assignee
    ? { id: task.assignee.id, name: task.assignee.name }
    : null,
  adrNumber: task.adr?.number ?? null,
});
