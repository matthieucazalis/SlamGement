import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const TEST_DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgresql://slamgement:slamgement_dev@localhost:5432/slamgement_test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "fr-FR",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,

      AUTH_TRUST_HOST: "true",
      AUTH_URL: `http://localhost:${PORT}`,
    },
  },
});
