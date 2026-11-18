// Client de l'API SlamGement. Aucune dépendance à React : il ne fait que des
// appels `fetch` et transforme les erreurs en une classe unique, ErreurApi.
import type {
  Adr,
  Message,
  NouvelAdr,
  Projet,
  ReponseConnexion,
  ResumeAdr,
  StatutAdr,
  StatutTache,
  Tache,
  Utilisateur,
} from "@/data/types";

export type CodeErreur =
  | "reseau" // pas de connexion, serveur éteint, mauvaise adresse
  | "delai" // le serveur n'a pas répondu à temps
  | "non_authentifie" // jeton absent, expiré ou révoqué
  | "identifiants" // email ou mot de passe faux
  | "trop_de_tentatives"
  | "trop_de_messages" // quota de la messagerie dépassé
  | "introuvable"
  | "conflit" // transition interdite…
  | "validation"
  | "image"
  | "serveur"
  | "inconnue";

export class ErreurApi extends Error {
  constructor(
    public code: CodeErreur,
    public statut?: number,
    public champs: string[] = [],
  ) {
    super(code);
    this.name = "ErreurApi";
  }
}

const DELAI_MS = 15_000;

type Options = {
  methode?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  corps?: unknown;
  jeton?: string | null;
};

// Convertit le statut HTTP + le code renvoyé par le serveur en erreur typée
function versErreur(
  statut: number,
  code?: string,
  champs?: string[],
): ErreurApi {
  if (code === "invalid_credentials")
    return new ErreurApi("identifiants", statut);
  if (code === "too_many_attempts")
    return new ErreurApi("trop_de_tentatives", statut);
  if (code === "validation") return new ErreurApi("validation", statut, champs);
  if (code === "invalid_image" || code === "image_too_large")
    return new ErreurApi("image", statut);
  if (code === "too_many_requests")
    return new ErreurApi("trop_de_messages", statut);
  if (statut === 401) return new ErreurApi("non_authentifie", statut);
  if (statut === 404) return new ErreurApi("introuvable", statut);
  if (statut === 409) return new ErreurApi("conflit", statut);
  if (statut === 422) return new ErreurApi("validation", statut, champs);
  if (statut === 429) return new ErreurApi("trop_de_tentatives", statut);
  if (statut >= 500) return new ErreurApi("serveur", statut);
  return new ErreurApi("inconnue", statut);
}

export async function appel<T>(
  serveur: string,
  chemin: string,
  { methode = "GET", corps, jeton }: Options = {},
): Promise<T> {
  const controle = new AbortController();
  const minuteur = setTimeout(() => controle.abort(), DELAI_MS);

  let reponse: Response;
  try {
    reponse = await fetch(`${serveur}/api/v1${chemin}`, {
      method: methode,
      headers: {
        Accept: "application/json",
        ...(corps !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
      },
      body: corps !== undefined ? JSON.stringify(corps) : undefined,
      signal: controle.signal,
    });
  } catch (e) {
    throw new ErreurApi(
      e instanceof Error && e.name === "AbortError" ? "delai" : "reseau",
    );
  } finally {
    clearTimeout(minuteur);
  }

  if (reponse.status === 204) return undefined as T;

  let donnees: unknown = null;
  try {
    donnees = await reponse.json();
  } catch {
    /* corps vide ou non JSON */
  }

  if (!reponse.ok) {
    const erreur = (
      donnees as { error?: { code?: string; fields?: string[] } } | null
    )?.error;
    throw versErreur(reponse.status, erreur?.code, erreur?.fields);
  }
  return donnees as T;
}

// Fonctions de l'API, regroupées pour que les écrans n'écrivent jamais d'URL
export function creerApi(serveur: string, jeton: string | null) {
  const o = (opts: Options = {}) => ({ ...opts, jeton });
  const projet = (id: string) => `/projects/${encodeURIComponent(id)}`;

  return {
    moi: () => appel<Utilisateur>(serveur, "/me", o()),
    projets: async () =>
      (await appel<{ data: Projet[] }>(serveur, "/projects", o())).data,
    projet: (id: string) => appel<Projet>(serveur, projet(id), o()),
    adrs: async (id: string, recherche?: string, statut?: StatutAdr) => {
      const params = new URLSearchParams();
      if (recherche?.trim()) params.set("q", recherche.trim());
      if (statut) params.set("status", statut);
      const qs = params.toString();
      return (
        await appel<{ data: ResumeAdr[] }>(
          serveur,
          `${projet(id)}/adrs${qs ? `?${qs}` : ""}`,
          o(),
        )
      ).data;
    },
    adr: (id: string, numero: number) =>
      appel<Adr>(serveur, `${projet(id)}/adrs/${numero}`, o()),
    creerAdr: (id: string, adr: NouvelAdr) =>
      appel<{ number: number; title: string; status: StatutAdr }>(
        serveur,
        `${projet(id)}/adrs`,
        o({ methode: "POST", corps: adr }),
      ),
    changerStatutAdr: (
      id: string,
      numero: number,
      statut: StatutAdr,
      remplacePar?: number,
    ) =>
      appel<{ number: number; status: StatutAdr }>(
        serveur,
        `${projet(id)}/adrs/${numero}`,
        o({
          methode: "PATCH",
          corps: { status: statut, replacement: remplacePar },
        }),
      ),
    taches: async (id: string, recherche?: string) => {
      const qs = recherche?.trim()
        ? `?q=${encodeURIComponent(recherche.trim())}`
        : "";
      return (
        await appel<{ data: Tache[] }>(serveur, `${projet(id)}/tasks${qs}`, o())
      ).data;
    },
    deplacerTache: (id: string, tacheId: string, statut: StatutTache) =>
      appel<{ id: string; status: StatutTache }>(
        serveur,
        `${projet(id)}/tasks/${encodeURIComponent(tacheId)}`,
        o({ methode: "PATCH", corps: { status: statut } }),
      ),
    messages: async (id: string) =>
      (await appel<{ data: Message[] }>(serveur, `${projet(id)}/messages`, o()))
        .data,
    envoyerMessage: (id: string, texte: string) =>
      appel<{ id: string }>(
        serveur,
        `${projet(id)}/messages`,
        o({ methode: "POST", corps: { body: texte } }),
      ),
    envoyerPhoto: (dataUrl: string) =>
      appel<{ avatar: string }>(
        serveur,
        "/me/avatar",
        o({ methode: "PUT", corps: { dataUrl } }),
      ),
    supprimerPhoto: () =>
      appel<void>(serveur, "/me/avatar", o({ methode: "DELETE" })),
    deconnexion: () =>
      appel<void>(serveur, "/auth/token", o({ methode: "DELETE" })),
  };
}

export type Api = ReturnType<typeof creerApi>;

export function connexion(
  serveur: string,
  email: string,
  motDePasse: string,
  appareil: string,
) {
  return appel<ReponseConnexion>(serveur, "/auth/token", {
    methode: "POST",
    corps: { email, password: motDePasse, deviceName: appareil },
  });
}
