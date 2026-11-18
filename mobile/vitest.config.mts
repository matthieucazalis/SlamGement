import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests de la logique pure (client d'API, règles, traductions) : aucun import React Native
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
