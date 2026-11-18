import { formatAdrNumber } from "@/lib/adr-format";
import type { AdrStatusValue } from "@/lib/adr-status";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { createTranslator } from "@/i18n/translate";

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

// Les titres de section suivent la langue de l'utilisateur ; le statut reste en
// anglais (proposed, accepted…) : c'est le vocabulaire standard de MADR.
export function adrToMarkdown(
  adr: AdrExportInput,
  locale: Locale = DEFAULT_LOCALE,
) {
  const t = createTranslator(locale);
  const status =
    adr.status === "SUPERSEDED" && adr.supersededBy
      ? `superseded by ${ref(adr.supersededBy)}`
      : adr.status.toLowerCase();

  const header = [
    `# ADR-${formatAdrNumber(adr.number)} : ${adr.title}`,
    [
      `- ${t("adr.export.status")} : ${status}`,
      `- ${t("adr.export.date")} : ${adr.createdAt.toISOString().slice(0, 10)}`,
      `- ${t("adr.export.author")} : ${adr.author.name}`,
      ...(adr.supersedes
        ? [`- ${t("adr.export.replaces")} : ${ref(adr.supersedes)}`]
        : []),
    ].join("\n"),
  ];

  const sections = [
    `## ${t("adr.export.context")}\n\n${adr.context.trim()}`,
    `## ${t("adr.export.decision")}\n\n${adr.decision.trim()}`,
    `## ${t("adr.export.consequences")}\n\n${adr.consequences.trim()}`,
    ...(adr.alternatives
      ? [`## ${t("adr.export.alternatives")}\n\n${adr.alternatives.trim()}`]
      : []),
    ...(adr.mermaidCode
      ? [
          `## ${t("adr.export.diagram")}\n\n${fence("mermaid", adr.mermaidCode)}`,
        ]
      : []),
  ];

  return [...header, ...sections].join("\n\n") + "\n";
}
