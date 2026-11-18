import Constants from "expo-constants";
import { normaliserAdresse } from "./adresse";

// Adresse du serveur : variable d'environnement, sinon on devine l'ordinateur
// qui fait tourner Metro (même Wi-Fi) et on suppose que le site est sur le
// port 3000 ; sinon localhost (émulateur web).
export function adresseParDefaut(): string {
  const configuree = process.env.EXPO_PUBLIC_API_URL;
  if (configuree) return normaliserAdresse(configuree) ?? configuree;

  const hote = Constants.expoConfig?.hostUri?.split(":")[0];
  return hote ? `http://${hote}:3000` : "http://localhost:3000";
}
