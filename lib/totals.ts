/**
 * Totals — sums and windows over logbook entries.
 *
 * Everything is computed from the entries themselves (no stored counters
 * to drift out of sync). Dates are YYYY-MM-DD; windows compare calendar
 * days, computed at UTC noon to avoid timezone edge cases.
 */
import { emptyTotals, TIME_FIELDS, type LogbookEntry, type TimeField, type Totals } from "./types";

/** Sum every numeric field across entries (optionally filtered). */
export function sumEntries(
  entries: LogbookEntry[],
  predicate?: (e: LogbookEntry) => boolean,
): Totals {
  const t = emptyTotals();
  for (const e of entries) {
    if (predicate && !predicate(e)) continue;
    for (const f of TIME_FIELDS) t[f] += e[f] ?? 0;
  }
  return t;
}

/** Totals grouped by aircraft type code. */
export function totalsByType(entries: LogbookEntry[]): Record<string, Totals> {
  const out: Record<string, Totals> = {};
  for (const e of entries) {
    out[e.aircraftType] ??= emptyTotals();
    for (const f of TIME_FIELDS) out[e.aircraftType][f] += e[f] ?? 0;
  }
  return out;
}

/** Parse YYYY-MM-DD as a UTC-noon Date (timezone-safe day math). */
export function parseDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12, 0, 0));
}

export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round(
    (parseDate(b).getTime() - parseDate(a).getTime()) / 86_400_000,
  );
}

/** Totals for entries within the last `days` days ending at `asOf` (inclusive). */
export function totalsInWindow(
  entries: LogbookEntry[],
  days: number,
  asOf: string,
): Totals {
  const asOfDate = parseDate(asOf);
  return sumEntries(entries, (e) => {
    const diff =
      (asOfDate.getTime() - parseDate(e.date).getTime()) / 86_400_000;
    return diff >= 0 && diff < days;
  });
}

/** Entries within the last `days` days ending at `asOf` (inclusive). */
export function entriesInWindow(
  entries: LogbookEntry[],
  days: number,
  asOf: string,
): LogbookEntry[] {
  const asOfDate = parseDate(asOf);
  return entries.filter((e) => {
    const diff =
      (asOfDate.getTime() - parseDate(e.date).getTime()) / 86_400_000;
    return diff >= 0 && diff < days;
  });
}

export interface AtpItem {
  label: string;
  have: number;
  need: number;
  pct: number;
  done: boolean;
}

/**
 * ATP minimums tracker (FAA 14 CFR 61.159) — the LogTen "Smart Groups"
 * idea, built in: total 1500, cross-country 500, night 100, instrument
 * 75, PIC 250, multi-engine 50. Multi-engine time comes from entries
 * whose aircraft is flagged multi-engine (via aircraft lookup by type).
 */
export function atpProgress(
  totals: Totals,
  multiEngineTime: number,
): AtpItem[] {
  const items: Array<[string, number, number]> = [
    ["Total time", totals.totalTime, 1500],
    ["Cross-country", totals.crossCountry, 500],
    ["Night", totals.night, 100],
    ["Instrument", totals.instrumentActual + totals.instrumentSimulated, 75],
    ["PIC", totals.pic, 250],
    ["Multi-engine", multiEngineTime, 50],
  ];
  return items.map(([label, have, need]) => ({
    label,
    have: Math.round(have * 10) / 10,
    need,
    pct: Math.min(100, Math.round((have / need) * 100)),
    done: have >= need,
  }));
}

/** One field of one entry, for the stats chart (hours per month). */
export function hoursPerMonth(
  entries: LogbookEntry[],
  months: number,
  asOf: string,
): Array<{ label: string; hours: number }> {
  const asOfDate = parseDate(asOf);
  const out: Array<{ label: string; hours: number }> = [];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(asOfDate.getUTCFullYear(), asOfDate.getUTCMonth() - i, 1, 12),
    );
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const hours = entries
      .filter((e) => {
        const ed = parseDate(e.date);
        return ed.getUTCFullYear() === y && ed.getUTCMonth() === m;
      })
      .reduce((sum, e) => sum + (e.totalTime || 0), 0);
    out.push({ label: monthNames[m], hours: Math.round(hours * 10) / 10 });
  }
  return out;
}

export type { TimeField };
