export const WINDOW_MS = 15 * 60 * 1000; // fenêtre de 15 minutes

export const LOGIN_LIMITS = {
  perEmail: 5,
  perIp: 20,
} as const;

export function isWindowExpired(windowStart: Date, now: Date = new Date()) {
  return now.getTime() - windowStart.getTime() >= WINDOW_MS;
}

export function isLimitReached(count: number, max: number) {
  return count >= max;
}

export function normalizeIp(header: string | null | undefined) {
  const first = header?.split(",")[0]?.trim();
  if (!first || first.length > 45 || !/^[0-9a-fA-F:.]+$/.test(first))
    return null;
  return first;
}
