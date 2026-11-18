"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Actualise la conversation toutes les 8 s, seulement quand l'onglet est visible.
export function AutoRefresh({ everyMs = 8000 }: { everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, everyMs);
    return () => clearInterval(timer);
  }, [router, everyMs]);
  return null;
}
