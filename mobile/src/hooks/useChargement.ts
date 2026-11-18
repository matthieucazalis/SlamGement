import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ErreurApi } from "@/api/client";
import { useAuth } from "@/context/auth";

export type EtatChargement<T> = {
  donnees: T | null;
  erreur: ErreurApi | null;
  chargement: boolean; // premier chargement : on affiche un indicateur
  actualisation: boolean; // rechargement (tirer pour actualiser)
  recharger: () => Promise<void>;
};

// Les trois états vus en cours : chargement, erreur, données. `cle` identifie
// ce qu'on charge (ex. l'identifiant du projet) ; quand elle change, on recharge.
// Avec `auFocus`, l'écran se recharge à chaque retour (après avoir créé un ADR…).
export function useChargement<T>(
  cle: string,
  charger: () => Promise<T>,
  { auFocus = false }: { auFocus?: boolean } = {},
): EtatChargement<T> {
  const { expirer } = useAuth();
  const [donnees, setDonnees] = useState<T | null>(null);
  const [erreur, setErreur] = useState<ErreurApi | null>(null);
  const [chargement, setChargement] = useState(true);
  const [actualisation, setActualisation] = useState(false);

  // la dernière version de `charger`, sans relancer le chargement à chaque rendu
  const chargerRef = useRef(charger);
  useEffect(() => {
    chargerRef.current = charger;
  });
  // écran encore affiché ?
  const monte = useRef(true);
  useEffect(() => {
    monte.current = true;
    return () => {
      monte.current = false;
    };
  }, []);
  // numéro de la dernière requête lancée : une réponse plus ancienne est ignorée
  const derniere = useRef(0);

  const executer = useCallback(async () => {
    const numero = ++derniere.current;
    try {
      const resultat = await chargerRef.current();
      if (!monte.current || numero !== derniere.current) return;
      setDonnees(resultat);
      setErreur(null);
    } catch (e) {
      if (!monte.current || numero !== derniere.current) return;
      const err = e instanceof ErreurApi ? e : new ErreurApi("inconnue");
      if (err.code === "non_authentifie") expirer();
      setErreur(err);
    } finally {
      if (monte.current && numero === derniere.current) {
        setChargement(false); // seul le premier chargement affiche l'indicateur plein écran
        setActualisation(false);
      }
    }
  }, [expirer]);

  // Au changement de `cle`, on relance le chargement. Les données précédentes
  // restent affichées pendant ce temps (pratique pour une recherche).
  useEffect(() => {
    if (!auFocus) void executer();
  }, [cle, auFocus, executer]);

  useFocusEffect(
    useCallback(() => {
      if (auFocus) void executer();
    }, [auFocus, executer]),
  );

  // Déclenchée par un bouton « Réessayer » ou un geste de rafraîchissement
  const recharger = useCallback(async () => {
    setErreur(null);
    setChargement(true); // sans effet si des données sont déjà affichées
    setActualisation(true);
    await executer();
  }, [executer]);

  return { donnees, erreur, chargement, actualisation, recharger };
}
