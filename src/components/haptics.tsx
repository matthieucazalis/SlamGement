"use client";

import { useEffect } from "react";
import { useHapticsEnabled } from "@/i18n/client";

// Équivalent web des vibrations (expo-haptics) : l'API Vibration fonctionne sur
// Android (Chrome, Firefox) ; iOS ne l'expose pas, l'appel est alors sans effet.
const PATTERNS = {
  light: 10,
  success: [15, 60, 15],
  error: [40, 40, 40],
} as const;

export type HapticKind = keyof typeof PATTERNS;

export function vibrate(kind: HapticKind) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  const pattern = PATTERNS[kind];
  navigator.vibrate(pattern as number | number[]);
}

// Tout élément portant data-haptic="light|success|error" fait vibrer au clic :
// aucun code à répéter dans chaque bouton.
export function HapticsListener() {
  const enabled = useHapticsEnabled();

  useEffect(() => {
    if (!enabled) return;
    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-haptic]",
      );
      const kind = target?.dataset.haptic as HapticKind | undefined;
      if (kind && kind in PATTERNS) vibrate(kind);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [enabled]);

  return null;
}
