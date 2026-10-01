/** Dates travel as YYYY-MM-DD strings so a picked day never shifts with the viewer's timezone. */
export type IsoDate = string;

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function parseIso(value: IsoDate | null | undefined) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) };
}

export function toIso(y: number, m: number, d: number): IsoDate {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** 30 Sep 2026 */
export function formatIsoDate(value: IsoDate | null | undefined, withYear = true) {
  const p = parseIso(value);
  if (!p) return "";
  return `${String(p.d).padStart(2, "0")} ${SHORT[p.m]}${withYear ? ` ${p.y}` : ""}`;
}
