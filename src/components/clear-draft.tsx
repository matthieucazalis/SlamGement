"use client";

import { useEffect } from "react";

export function ClearDraft({ storageKey }: { storageKey: string }) {
  useEffect(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignoré */
    }
  }, [storageKey]);
  return null;
}
