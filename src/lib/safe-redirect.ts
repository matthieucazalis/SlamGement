// Après la connexion, on renvoie l'utilisateur là où il voulait aller
// (ex. un lien d'invitation). Cette valeur vient de l'URL : c'est une entrée
// utilisateur, donc on n'accepte qu'un chemin interne (protection contre la
// redirection ouverte, OWASP A01).
const FALLBACK = "/projects";

export function safeCallbackPath(
  value: FormDataEntryValue | string | string[] | null | undefined,
  fallback: string = FALLBACK,
) {
  if (typeof value !== "string" || value.length > 500) return fallback;
  if (value.startsWith("//") || value.includes("\\")) return fallback;

  let url: URL;
  try {
    url = new URL(value, "http://placeholder.invalid");
  } catch {
    return fallback;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;

  // on ne garde que le chemin : l'adresse d'origine est ignorée
  const path = url.pathname + url.search;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (/^\/(login|register)(\/|\?|$)/.test(path)) return fallback;
  return path;
}
