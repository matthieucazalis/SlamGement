import { expect, test } from "@playwright/test";

test.describe("PWA", () => {
  test("le manifeste est public et complet", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest", { maxRedirects: 0 });
    expect(res.status()).toBe(200);

    const manifest = await res.json();
    expect(manifest.name).toBe("SlamGement");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/projects");

    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  test("les icônes sont des PNG publics", async ({ request }) => {
    for (const name of ["192", "512", "maskable", "apple"]) {
      const res = await request.get(`/icons/${name}`, { maxRedirects: 0 });
      expect(res.status(), `icône ${name}`).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    }
  });

  test("une icône inconnue donne une 404", async ({ request }) => {
    const res = await request.get("/icons/nimportequoi", { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });

  test("le service worker et la page hors ligne sont publics", async ({
    request,
  }) => {
    const sw = await request.get("/sw.js", { maxRedirects: 0 });
    expect(sw.status()).toBe(200);
    expect(sw.headers()["content-type"]).toContain("javascript");
    expect(sw.headers()["cache-control"]).toContain("no-cache");

    const offline = await request.get("/offline", { maxRedirects: 0 });
    expect(offline.status()).toBe(200);
  });

  test("le service worker s'enregistre dans le navigateur", async ({
    page,
  }) => {
    await page.goto("/login");
    const active = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return Boolean(registration.active);
    });
    expect(active).toBe(true);
  });
});
