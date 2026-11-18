import { headers } from "next/headers";

// Adresse publique du site, utilisée dans les liens envoyés par e-mail.
// En production, AUTH_URL doit être défini : on n'utilise JAMAIS l'en-tête Host
// fourni par le client pour construire un lien (empoisonnement de lien).
export async function getBaseUrl() {
  const configured = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (configured) return configured.replace(/\/+$/, "");

  // Développement uniquement
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
