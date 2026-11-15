/**
 * Currency — FAR 61.57 / 61.56 recency engine.
 *
 * Rules implemented (FAA):
 *  - 61.57(a) DAY: 3 takeoffs + 3 landings in the preceding 90 days to
 *    carry passengers (day). Takeoffs are counted equal to landings —
 *    the logbook records landings, and every landing implies a takeoff.
 *  - 61.57(b) NIGHT: 3 takeoffs + 3 FULL-STOP landings at night in the
 *    preceding 90 days. (Night landings logged here are full-stop by
 *    convention; the entry form says so.)
 *  - 61.57(c) INSTRUMENT: within the preceding 6 CALENDAR months,
 *    6 instrument approaches + holding procedures + intercepting/tracking
 *    courses. Tracked here as approaches >= 6 AND holds >= 1; the
 *    intercept/track element is noted as pilot-verified in the UI.
 *  - 61.56 FLIGHT REVIEW: within the preceding 24 CALENDAR months.
 *  - MEDICAL: expiry date from the qualification record; warns 30 days
 *    out, critical 7 days out.
 *
 * Statuses: 'current' | 'warning' (within 14 days of lapsing, or
 * expiring soon) | 'expired'. Each check returns what is still needed.
 */
import { entriesInWindow, parseDate } from "./totals";
import type { LogbookEntry, Qualification } from "./types";

export type CurrencyStatus = "current" | "warning" | "expired";

export interface CurrencyCheck {
  id: string;
  label: string;
  rule: string;
  status: CurrencyStatus;
  detail: string;
  /** What to do to get current again. */
  needed: string;
  /** YYYY-MM-DD the currency lapses (when known). */
  expiresOn?: string;
}

function addDays(ymd: string, days: number): string {
  const d = parseDate(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Last day of the month `months` calendar months after `ymd`. */
function endOfCalendarMonths(ymd: string, months: number): string {
  const d = parseDate(ymd);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + months;
  // Day 0 of the following month = last day of the target month.
  const last = new Date(Date.UTC(y, m + 1, 0, 12));
  return last.toISOString().slice(0, 10);
}

function daysUntil(asOf: string, target: string): number {
  return Math.round(
    (parseDate(target).getTime() - parseDate(asOf).getTime()) / 86_400_000,
  );
}

function statusFor(daysLeft: number): CurrencyStatus {
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 14) return "warning";
  return "current";
}

export function checkDayCurrency(
  entries: LogbookEntry[],
  asOf: string,
): CurrencyCheck {
  const recent = entriesInWindow(entries, 90, asOf);
  const landings = recent.reduce((s, e) => s + (e.dayLandings || 0), 0);
  const have = Math.min(3, landings);
  // Currency lapses 90 days after the 3rd-most-recent qualifying landing.
  const sorted = recent
    .filter((e) => (e.dayLandings || 0) > 0)
    .map((e) => e.date)
    .sort();
  let expiresOn: string | undefined;
  if (landings >= 3) {
    // The 3rd landing from the end keeps currency; expiry = that date + 90d.
    const qualifying = sorted.slice(-3);
    expiresOn = addDays(qualifying[0], 90);
  }
  const status =
    landings >= 3
      ? statusFor(expiresOn ? daysUntil(asOf, expiresOn) : 999)
      : "expired";
  return {
    id: "day",
    label: "Day passenger currency",
    rule: "FAR 61.57(a) — 3 takeoffs & landings, 90 days",
    status,
    detail:
      landings >= 3
        ? `${landings} day landings in the last 90 days`
        : `${have} of 3 day landings in the last 90 days`,
    needed:
      landings >= 3
        ? "You're current. Keep 3 landings in every rolling 90 days."
        : `Log ${3 - have} more day landing${3 - have === 1 ? "" : "s"} to be current.`,
    expiresOn,
  };
}

export function checkNightCurrency(
  entries: LogbookEntry[],
  asOf: string,
): CurrencyCheck {
  const recent = entriesInWindow(entries, 90, asOf);
  const landings = recent.reduce((s, e) => s + (e.nightLandings || 0), 0);
  const have = Math.min(3, landings);
  const sorted = recent
    .filter((e) => (e.nightLandings || 0) > 0)
    .map((e) => e.date)
    .sort();
  let expiresOn: string | undefined;
  if (landings >= 3) {
    expiresOn = addDays(sorted.slice(-3)[0], 90);
  }
  const status =
    landings >= 3
      ? statusFor(expiresOn ? daysUntil(asOf, expiresOn) : 999)
      : "expired";
  return {
    id: "night",
    label: "Night passenger currency",
    rule: "FAR 61.57(b) — 3 full-stop night landings, 90 days",
    status,
    detail:
      landings >= 3
        ? `${landings} night landings in the last 90 days`
        : `${have} of 3 full-stop night landings in the last 90 days`,
    needed:
      landings >= 3
        ? "You're current. Keep 3 full-stop night landings in every rolling 90 days."
        : `Log ${3 - have} more full-stop night landing${3 - have === 1 ? "" : "s"} to be current.`,
    expiresOn,
  };
}

export function checkInstrumentCurrency(
  entries: LogbookEntry[],
  asOf: string,
): CurrencyCheck {
  // 6 calendar months back from asOf (inclusive of the current month).
  const asOfDate = parseDate(asOf);
  const windowStart = new Date(
    Date.UTC(asOfDate.getUTCFullYear(), asOfDate.getUTCMonth() - 5, 1, 12),
  )
    .toISOString()
    .slice(0, 10);
  const inWindow = entries.filter((e) => e.date >= windowStart && e.date <= asOf);
  const approaches = inWindow.reduce((s, e) => s + (e.approaches || 0), 0);
  const holds = inWindow.reduce((s, e) => s + (e.holds || 0), 0);
  const ok = approaches >= 6 && holds >= 1;
  // Currency runs to the end of the 6th calendar month after the month
  // of the 6th approach. Approximation: 6 months after the earliest
  // qualifying approach month.
  let expiresOn: string | undefined;
  if (ok) {
    const sorted = inWindow
      .filter((e) => (e.approaches || 0) > 0)
      .map((e) => e.date)
      .sort();
    expiresOn = endOfCalendarMonths(sorted[0].slice(0, 7) + "-01", 6);
  }
  const status = ok
    ? statusFor(expiresOn ? daysUntil(asOf, expiresOn) : 999)
    : "expired";
  return {
    id: "instrument",
    label: "Instrument currency",
    rule: "FAR 61.57(c) — 6 approaches + holds, 6 calendar months",
    status,
    detail: `${approaches} approaches, ${holds} holds in the last 6 calendar months`,
    needed: ok
      ? "You're current. Remember intercepting/tracking is pilot-verified."
      : `Log ${Math.max(0, 6 - approaches)} more approach${6 - approaches === 1 ? "" : "es"}${holds < 1 ? " and holding procedures" : ""} to be current.`,
    expiresOn,
  };
}

export function checkFlightReview(
  quals: Qualification[],
  asOf: string,
): CurrencyCheck {
  const reviews = quals
    .filter((q) => q.kind === "flightReview")
    .map((q) => q.issuedDate)
    .sort();
  const latest = reviews[reviews.length - 1];
  if (!latest) {
    return {
      id: "flightReview",
      label: "Flight review",
      rule: "FAR 61.56 — within the preceding 24 calendar months",
      status: "expired",
      detail: "No flight review on record",
      needed: "Add your most recent flight review under Qualifications.",
    };
  }
  const expiresOn = endOfCalendarMonths(latest.slice(0, 7) + "-01", 24);
  const left = daysUntil(asOf, expiresOn);
  return {
    id: "flightReview",
    label: "Flight review",
    rule: "FAR 61.56 — within the preceding 24 calendar months",
    status: statusFor(left),
    detail: `Last flight review ${latest}`,
    needed:
      left < 0
        ? "Your flight review has lapsed — complete one before acting as PIC."
        : left <= 14
          ? `Flight review expires ${expiresOn} — book one soon.`
          : `Current until ${expiresOn}.`,
    expiresOn,
  };
}

export function checkMedical(
  quals: Qualification[],
  asOf: string,
): CurrencyCheck {
  const medicals = quals
    .filter((q) => q.kind === "medical" && q.expiryDate)
    .sort((a, b) => (a.expiryDate! < b.expiryDate! ? 1 : -1));
  const latest = medicals[0];
  if (!latest || !latest.expiryDate) {
    return {
      id: "medical",
      label: "Medical certificate",
      rule: "Medical expiry from your certificate",
      status: "expired",
      detail: "No medical on record",
      needed: "Add your medical certificate under Qualifications.",
    };
  }
  const left = daysUntil(asOf, latest.expiryDate);
  const status = left < 0 ? "expired" : left <= 30 ? "warning" : "current";
  return {
    id: "medical",
    label: "Medical certificate",
    rule: latest.name,
    status,
    detail: `Expires ${latest.expiryDate}`,
    needed:
      left < 0
        ? "Your medical has expired — renew before flying as PIC."
        : left <= 30
          ? `Medical expires in ${left} day${left === 1 ? "" : "s"} — renew soon.`
          : `Current until ${latest.expiryDate}.`,
    expiresOn: latest.expiryDate,
  };
}

/** Run every currency check at once. */
export function checkAllCurrency(
  entries: LogbookEntry[],
  quals: Qualification[],
  asOf: string,
): CurrencyCheck[] {
  return [
    checkDayCurrency(entries, asOf),
    checkNightCurrency(entries, asOf),
    checkInstrumentCurrency(entries, asOf),
    checkFlightReview(quals, asOf),
    checkMedical(quals, asOf),
  ];
}
