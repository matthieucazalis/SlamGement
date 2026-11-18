import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

// Comme useState, mais la valeur survit à la fermeture de l'appli : elle est
// relue au démarrage et enregistrée à chaque changement (même principe que le
// hook vu en cours). AsyncStorage ne stocke que du texte : JSON.stringify et
// JSON.parse.
//  - `valider` (facultatif) protège contre une valeur corrompue ou d'une
//    ancienne version de l'appli ;
//  - `charge` passe à true quand la lecture est terminée (évite d'afficher la
//    valeur initiale pendant une fraction de seconde).
export function useStockage<T>(
  cle: string,
  valeurInitiale: T,
  valider?: (valeur: unknown) => valeur is T,
) {
  const [valeur, setValeur] = useState<T>(valeurInitiale);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    let annule = false;
    AsyncStorage.getItem(cle)
      .then((json) => {
        if (annule || json === null) return;
        try {
          const lue: unknown = JSON.parse(json);
          if (!valider || valider(lue)) setValeur(lue as T);
        } catch {
          /* JSON invalide : on garde la valeur initiale */
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!annule) setCharge(true);
      });
    return () => {
      annule = true;
    };
    // `valider` est une fonction pure déclarée hors du composant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  useEffect(() => {
    if (charge)
      AsyncStorage.setItem(cle, JSON.stringify(valeur)).catch(() => undefined);
  }, [cle, valeur, charge]);

  const effacer = () => {
    AsyncStorage.removeItem(cle).catch(() => undefined);
    setValeur(valeurInitiale);
  };

  return [valeur, setValeur, charge, effacer] as const;
}
