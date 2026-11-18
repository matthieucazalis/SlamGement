import { createContext, useContext, type ReactNode } from "react";
import { useStockage } from "@/hooks/useStockage";
import { useAuth } from "./auth";
import { usePreferences } from "./preferences";

export type Favori = {
  projetId: string;
  projetNom: string;
  numero: number;
  titre: string;
};

const estListe = (v: unknown): v is Favori[] =>
  Array.isArray(v) &&
  v.every(
    (f) =>
      f &&
      typeof f.projetId === "string" &&
      typeof f.projetNom === "string" &&
      typeof f.numero === "number" &&
      typeof f.titre === "string",
  );

type Valeur = {
  favoris: Favori[];
  estFavori: (projetId: string, numero: number) => boolean;
  basculer: (favori: Favori) => void;
};

const Contexte = createContext<Valeur | null>(null);

const VIDE: Valeur = {
  favoris: [],
  estFavori: () => false,
  basculer: () => undefined,
};

export function FavorisProvider({ children }: { children: ReactNode }) {
  const { utilisateur } = useAuth();
  const compteId = utilisateur?.id;

  if (!compteId)
    return <Contexte.Provider value={VIDE}>{children}</Contexte.Provider>;

  return (
    <FavorisCompte key={compteId} compteId={compteId}>
      {children}
    </FavorisCompte>
  );
}

function FavorisCompte({
  compteId,
  children,
}: {
  compteId: string;
  children: ReactNode;
}) {
  const [favoris, setFavoris] = useStockage<Favori[]>(
    `favoris.adr.${compteId}`,
    [],
    estListe,
  );
  const { vibrer } = usePreferences();

  const estFavori = (projetId: string, numero: number) =>
    favoris.some((f) => f.projetId === projetId && f.numero === numero);

  const basculer = (favori: Favori) => {
    vibrer("leger");
    setFavoris((actuels) =>
      actuels.some(
        (f) => f.projetId === favori.projetId && f.numero === favori.numero,
      )
        ? actuels.filter(
            (f) =>
              !(f.projetId === favori.projetId && f.numero === favori.numero),
          )
        : [...actuels, favori],
    );
  };

  return (
    <Contexte.Provider value={{ favoris, estFavori, basculer }}>
      {children}
    </Contexte.Provider>
  );
}

export function useFavoris() {
  const valeur = useContext(Contexte);
  if (!valeur)
    throw new Error("useFavoris doit être utilisé dans <FavorisProvider>");
  return valeur;
}
