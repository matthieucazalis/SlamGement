import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests d'intégration : les services tournent contre une vraie base PostgreSQL.
// Lancer avec DATABASE_URL pointant vers une base DE TEST (voir tests/integration/setup.ts).
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      // next-auth importe « next/server » sans extension : Node ne le résout pas
      // hors de Next. On pointe vers les fichiers réels.
      { find: /^next\/(server|headers)$/, replacement: "next/$1.js" },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["tests/integration/setup.ts"],
    // une seule base partagée : les fichiers s'exécutent l'un après l'autre
    fileParallelism: false,
    testTimeout: 20_000,
    // next-auth est traité par Vite (et non chargé tel quel par Node) pour que
    // l'alias « next/server » ci-dessus s'applique
    server: { deps: { inline: [/next-auth/, /@auth\/core/] } },
  },
});
