// Contrôle léger d'un schéma Mermaid, utilisable côté serveur comme côté client
// (le vrai parseur de Mermaid a besoin d'un navigateur).
// Rejette ce qui n'est manifestement pas un schéma, avant de le stocker ou de
// le passer à Mermaid.

const DIAGRAM_TYPES = [
  "graph",
  "flowchart",
  "sequenceDiagram",
  "classDiagram",
  "stateDiagram",
  "stateDiagram-v2",
  "erDiagram",
  "journey",
  "gantt",
  "pie",
  "quadrantChart",
  "requirementDiagram",
  "gitGraph",
  "mindmap",
  "timeline",
  "C4Context",
  "C4Container",
  "C4Component",
  "C4Dynamic",
  "C4Deployment",
  "sankey-beta",
  "xychart-beta",
  "block-beta",
  "architecture-beta",
];

// Premier mot significatif du texte (hors commentaires %% et lignes vides)
function firstKeyword(code: string): string | null {
  for (const raw of code.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("%%")) continue;
    return line.split(/[\s;{]/)[0] ?? null;
  }
  return null;
}

export function looksLikeMermaid(code: string): boolean {
  const word = firstKeyword(code);
  return word !== null && DIAGRAM_TYPES.includes(word);
}

// Les directives %%{init: ...}%% peuvent changer la configuration de sécurité
// de Mermaid : on les refuse.
export function hasMermaidDirective(code: string): boolean {
  return /%%\{/.test(code);
}

export function isAcceptableMermaid(code: string): boolean {
  return looksLikeMermaid(code) && !hasMermaidDirective(code);
}
