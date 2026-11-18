export type Couleurs = {
  fond: string;
  carte: string;
  carteActive: string;
  texte: string;
  texteDoux: string;
  bordure: string;
  primaire: string;
  surPrimaire: string;
  danger: string;
  succes: string;
  champ: string;
};

export const COULEURS: Record<"clair" | "sombre", Couleurs> = {
  clair: {
    fond: "#f8fafc",
    carte: "#ffffff",
    carteActive: "#f1f5f9",
    texte: "#0f172a",
    texteDoux: "#64748b",
    bordure: "#e2e8f0",
    primaire: "#2563eb",
    surPrimaire: "#ffffff",
    danger: "#dc2626",
    succes: "#16a34a",
    champ: "#ffffff",
  },
  sombre: {
    fond: "#0b1220",
    carte: "#131c2e",
    carteActive: "#1b2740",
    texte: "#f1f5f9",
    texteDoux: "#94a3b8",
    bordure: "#25324b",
    primaire: "#60a5fa",
    surPrimaire: "#0b1220",
    danger: "#f87171",
    succes: "#4ade80",
    champ: "#0f1829",
  },
};

// Couleurs des pastilles de statut (fond / texte), lisibles dans les deux thèmes
export const STATUTS_ADR_COULEURS = {
  PROPOSED: { clair: ["#dbeafe", "#1e40af"], sombre: ["#1e3a8a", "#bfdbfe"] },
  ACCEPTED: { clair: ["#dcfce7", "#166534"], sombre: ["#14532d", "#bbf7d0"] },
  REJECTED: { clair: ["#fee2e2", "#991b1b"], sombre: ["#7f1d1d", "#fecaca"] },
  DEPRECATED: { clair: ["#ffedd5", "#9a3412"], sombre: ["#7c2d12", "#fed7aa"] },
  SUPERSEDED: { clair: ["#f3e8ff", "#6b21a8"], sombre: ["#581c87", "#e9d5ff"] },
} as const;
