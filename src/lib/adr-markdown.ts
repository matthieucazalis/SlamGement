import { formatAdrNumber } from "@/lib/adr-format";
import type { AdrStatusValue } from "@/lib/adr-status";

type AdrRef = { number: number; title: string };

export type AdrExportInput = {
  number: number;
  title: string;
  status: AdrStatusValue;
  createdAt: Date;
  context: string;
  decision: string;
  consequences: string;
  alternatives: string | null;
  mermaidCode: string | null;
  author: { name: string };
  supersededBy: AdrRef | null;
  supersedes: AdrRef | null;
};

export function slugify(text: string) {
  const slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "adr";
}

export function adrFileName(number: number, title: string) {
  return `${formatAdrNumber(number)}-${slugify(title)}.md`;
}

function fence(lang: string, code: string) {
  const longest = Math.max(
    2,
    ...(code.match(/`+/g) ?? []).map((m) => m.length),
  );
  const ticks = "`".repeat(longest + 1);
  return `${ticks}${lang}\n${code.trim()}\n${ticks}`;
}

function ref(r: AdrRef) {
  return `[ADR-${formatAdrNumber(r.number)}](${adrFileName(r.number, r.title)})`;
}

export function adrToMarkdown(adr: AdrExportInput) {
  const status =
    adr.status === "SUPERSEDED" && adr.supersededBy
      ? `superseded by ${ref(adr.supersededBy)}`
      : adr.status.toLowerCase();

  const header = [
    `# ADR-${formatAdrNumber(adr.number)} : ${adr.title}`,
    [
      `- Statut : ${status}`,
      `- Date : ${adr.createdAt.toISOString().slice(0, 10)}`,
      `- Auteur : ${adr.author.name}`,
      ...(adr.supersedes ? [`- Remplace : ${ref(adr.supersedes)}`] : []),
    ].join("\n"),
  ];

  const sections = [
    `## Contexte\n\n${adr.context.trim()}`,
    `## Décision\n\n${adr.decision.trim()}`,
    `## Conséquences\n\n${adr.consequences.trim()}`,
    ...(adr.alternatives
      ? [`## Alternatives étudiées\n\n${adr.alternatives.trim()}`]
      : []),
    ...(adr.mermaidCode
      ? [`## Schéma\n\n${fence("mermaid", adr.mermaidCode)}`]
      : []),
  ];

  return [...header, ...sections].join("\n\n") + "\n";
}
