"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

// Équivalent web du hook useStockage vu en cours React Native : se comporte
// comme useState, mais la valeur survit à la fermeture de l'onglet ou de
// l'appli (localStorage joue le rôle d'AsyncStorage).
//  - `validate` protège contre une valeur absente ou modifiée à la main ;
//  - toute erreur de stockage (mode privé, quota plein) est ignorée : l'appli
//    continue de fonctionner, simplement sans mémoire ;
//  - la lecture passe par useSyncExternalStore : le rendu serveur et le premier
//    rendu client sont identiques (pas d'erreur d'hydratation).
const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useStorage<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
  enabled = true,
) {
  const raw = useSyncExternalStore(
    subscribe,
    () => (enabled ? read(key) : null),
    () => null,
  );

  const stored = useMemo<T | undefined>(() => {
    if (raw === null) return undefined;
    try {
      const parsed: unknown = JSON.parse(raw);
      return validate(parsed) ? parsed : undefined;
    } catch {
      return undefined; // JSON invalide
    }
  }, [raw, validate]);

  // Les modifications de l'utilisateur dans cette session ; tant qu'il n'a
  // rien changé, on affiche ce qui est enregistré (ou la valeur initiale).
  const [edited, setEdited] = useState<T | undefined>(undefined);
  const value = edited ?? stored ?? initial;

  const setValue = useCallback(
    (update: T | ((previous: T) => T)) => {
      const next =
        typeof update === "function"
          ? (update as (previous: T) => T)(value)
          : update;
      setEdited(next);
      if (!enabled) return;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignoré */
      }
    },
    [enabled, key, value],
  );

  // Efface le brouillon enregistré et revient à la valeur initiale
  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignoré */
    }
    setEdited(undefined);
  }, [key]);

  return {
    value,
    setValue,
    reset,
    restored: stored !== undefined && edited === undefined,
  };
}
