import { ArrowUp, Folder, Star, TextBubble, User } from "@getpapillon/papicons";

// Point unique pour les icônes de l'application (jeu Papicons, licence MIT).
// Pour changer une icône, on ne modifie que cette table.
const ICONES = {
  projets: Folder,
  favori: Star,
  messages: TextBubble,
  envoyer: ArrowUp,
  profil: User,
} as const;

export type NomIcone = keyof typeof ICONES;

export function Icone({
  nom,
  taille = 24,
  couleur,
}: {
  nom: NomIcone;
  taille?: number;
  couleur: string;
}) {
  const Composant = ICONES[nom];
  return <Composant size={taille} color={couleur} />;
}
