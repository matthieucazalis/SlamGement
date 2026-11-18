import { useEffect, useState } from "react";

// Attend que la saisie se calme avant de lancer une recherche (évite un appel
// réseau à chaque lettre tapée).
export function useDebounce<T>(valeur: T, delaiMs = 400): T {
  const [differee, setDifferee] = useState(valeur);
  useEffect(() => {
    const minuteur = setTimeout(() => setDifferee(valeur), delaiMs);
    return () => clearTimeout(minuteur);
  }, [valeur, delaiMs]);
  return differee;
}
