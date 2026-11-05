// Le serveur tourne en UTC (conteneur Docker, Vercel…) alors que les
// utilisateurs sont en France : sans fuseau explicite, les heures affichées
// auraient 1 à 2 h de décalage. On fixe donc le fuseau de l'application.
export const APP_TIME_ZONE = "Europe/Paris";

export function formatDateTime(date: Date) {
  return date.toLocaleString("fr-FR", { timeZone: APP_TIME_ZONE });
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { timeZone: APP_TIME_ZONE });
}

// Décalage (en ms) entre l'heure murale du fuseau et UTC à un instant donné.
function zoneOffsetMs(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

// Minuit (heure de Paris) du jour « AAAA-MM-JJ », décalé de `plusDays` jours.
// Renvoie undefined si la date est absente ou invalide.
export function startOfDayInAppZone(
  value: string | undefined,
  plusDays = 0,
  timeZone: string = APP_TIME_ZONE,
) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  const utcMidnight = new Date(Date.UTC(y, m - 1, d + plusDays));
  if (
    Number.isNaN(utcMidnight.getTime()) ||
    (plusDays === 0 && utcMidnight.getUTCDate() !== d) // ex. 2026-02-31
  )
    return undefined;
  return new Date(utcMidnight.getTime() - zoneOffsetMs(utcMidnight, timeZone));
}
