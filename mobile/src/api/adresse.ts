// Nettoie ce que l'utilisateur a saisi : ajoute http:// si besoin, enlève les
// espaces et les « / » finaux. Renvoie null si ce n'est pas une adresse valide.
export function normaliserAdresse(saisie: string): string | null {
  let valeur = saisie.trim();
  if (!valeur) return null;
  if (!/^https?:\/\//i.test(valeur)) valeur = `http://${valeur}`;
  try {
    const url = new URL(valeur);
    if (!url.hostname) return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}
