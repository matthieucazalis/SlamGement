// Lance le site (port 3000) et l'application mobile (Expo) en une commande.
// Détecte l'IP du PC sur le réseau local et la donne à l'app mobile.
import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";

function ipLocale() {
  const candidates = [];
  for (const [nom, liste] of Object.entries(networkInterfaces())) {
    for (const a of liste ?? []) {
      if (a.family !== "IPv4" || a.internal) continue;
      // on ignore les cartes virtuelles (WSL, Docker, VirtualBox, VPN)
      if (/wsl|vethernet|docker|virtualbox|vmware|vpn|tailscale/i.test(nom))
        continue;
      candidates.push(a.address);
    }
  }
  return (
    candidates.find((ip) => ip.startsWith("192.168.")) ??
    candidates.find((ip) => ip.startsWith("10.")) ??
    candidates[0]
  );
}

const ip = process.env.EXPO_PUBLIC_API_URL ? null : ipLocale();
const api = process.env.EXPO_PUBLIC_API_URL ?? (ip ? `http://${ip}:3000` : "");
console.log(`\n[dev-all] Adresse du site pour le mobile : ${api || "(auto)"}\n`);

const shell = process.platform === "win32";
const enfants = [
  spawn("npm", ["run", "dev", "--", "-H", "0.0.0.0"], {
    stdio: "inherit",
    shell,
  }),
  spawn("npx", ["expo", "start", "-c"], {
    cwd: "mobile",
    stdio: "inherit",
    shell,
    env: { ...process.env, ...(api ? { EXPO_PUBLIC_API_URL: api } : {}) },
  }),
];

const arreter = () => enfants.forEach((e) => e.kill());
process.on("SIGINT", arreter);
process.on("SIGTERM", arreter);
enfants.forEach((e) => e.on("exit", arreter));
