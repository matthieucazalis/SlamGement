export function formatAdrNumber(n: number) {
  return String(n).padStart(4, "0");
}

export function parseAdrNumber(value: string) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}
