// Garde-fou : ces tests créent et suppriment des données. On refuse de les
// lancer sur une base dont le nom ne se termine pas par « _test », pour ne
// jamais toucher aux données de développement ou de démonstration.
const url = process.env.DATABASE_URL ?? "";
const dbName = url.split("?")[0].split("/").pop() ?? "";

if (!dbName.endsWith("_test")) {
  throw new Error(
    `Tests d'intégration refusés : la base « ${dbName || "?"} » n'est pas une base de test (nom attendu : *_test).\n` +
      `Exemple : DATABASE_URL=postgresql://slamgement:slamgement_dev@localhost:5432/slamgement_test npm run test:integration`,
  );
}
