import {
  Butterfly,
  GlobeCross,
  Paper,
  Tasks,
  TextBubble,
  User,
} from "@getpapillon/papicons";

// Point unique pour les icônes du site (jeu Papicons, licence MIT).
// Pour changer une icône, on ne modifie que cette table.
const ICONS = {
  logo: Butterfly,
  adr: Paper,
  kanban: Tasks,
  chat: TextBubble,
  team: User,
  offline: GlobeCross,
} as const;

export type AppIconName = keyof typeof ICONS;

// La couleur « currentColor » suit le texte : thème clair/sombre automatique.
export function AppIcon({
  name,
  size = 20,
}: {
  name: AppIconName;
  size?: number;
}) {
  const Icon = ICONS[name];
  return <Icon size={size} color="currentColor" />;
}
