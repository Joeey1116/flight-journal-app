/**
 * Companion-sim import contract — designed, name-agnostic.
 *
 * The companion flight simulator — "HorizonFS: Mobile Flight Simulator",
 * Joey's sixth app — can hand a finished flight to this logbook, and the
 * logbook imports it as a sim flight. The contract
 * is a plain JSON payload so EITHER side can implement it without
 * depending on the other's code:
 *
 *   1. Deep link (same device): flightjournal://import-sim?data=<base64url JSON>
 *   2. Share / paste: the same JSON object, pasted into More → Import sim flight.
 *
 * Every imported flight is flagged isSim: true and never counts toward
 * real-aircraft totals — it lives in its own sim totals (ForeFlight and
 * LogTen both keep simulator time separate from aircraft time).
 * The payload is validated before anything is written; bad payloads are
 * rejected with a list of problems, never partially imported.
 */
import { newEntryId, type LogbookEntry } from "./types";

export interface SimFlightPayload {
  schemaVersion: 1;
  /** Always "companion-sim" — identifies the sender, not a brand name. */
  source: "companion-sim";
  /** The sim session id (lets the logbook de-duplicate re-imports). */
  sessionId: string;
  /** YYYY-MM-DD. */
  date: string;
  aircraftType: string;
  aircraftModel: string;
  registration: string;
  departure: string;
  arrival: string;
  route?: string;
  totalTime: number;
  pic?: number;
  night?: number;
  instrumentSimulated?: number;
  dayLandings?: number;
  nightLandings?: number;
  approaches?: number;
  holds?: number;
  remarks?: string;
}

const ICAO_RE = /^[A-Z]{4}$/;

export function validateSimPayload(
  value: unknown,
): { ok: true; payload: SimFlightPayload } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (typeof value !== "object" || value === null) {
    return { ok: false, errors: ["Payload must be a JSON object."] };
  }
  const v = value as Record<string, unknown>;
  const req = (key: string, check: (x: unknown) => boolean, msg: string) => {
    if (!check(v[key])) errors.push(`${key}: ${msg}`);
  };
  req("schemaVersion", (x) => x === 1, "must be 1");
  req("source", (x) => x === "companion-sim", 'must be "companion-sim"');
  req("sessionId", (x) => typeof x === "string" && x.length > 0, "required");
  req("date", (x) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x), "YYYY-MM-DD required");
  req("aircraftType", (x) => typeof x === "string" && x.length > 0, "required");
  req("aircraftModel", (x) => typeof x === "string" && x.length > 0, "required");
  req("registration", (x) => typeof x === "string" && x.length > 0, "required");
  req("departure", (x) => typeof x === "string" && ICAO_RE.test(x), "4-letter ICAO required");
  req("arrival", (x) => typeof x === "string" && ICAO_RE.test(x), "4-letter ICAO required");
  req("totalTime", (x) => typeof x === "number" && x > 0, "must be a number > 0");
  for (const k of ["pic", "night", "instrumentSimulated", "dayLandings", "nightLandings", "approaches", "holds"]) {
    if (v[k] !== undefined && (typeof v[k] !== "number" || (v[k] as number) < 0)) {
      errors.push(`${k}: must be a number >= 0`);
    }
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, payload: v as unknown as SimFlightPayload };
}

export function simPayloadToEntry(p: SimFlightPayload): LogbookEntry {
  const now = new Date().toISOString();
  return {
    id: newEntryId(),
    date: p.date,
    aircraftType: p.aircraftType.toUpperCase(),
    aircraftModel: p.aircraftModel,
    registration: p.registration.toUpperCase(),
    departure: p.departure.toUpperCase(),
    arrival: p.arrival.toUpperCase(),
    route: p.route,
    totalTime: p.totalTime,
    pic: p.pic ?? 0,
    sic: 0,
    dualReceived: 0,
    dualGiven: 0,
    solo: 0,
    crossCountry: 0,
    night: p.night ?? 0,
    instrumentActual: 0,
    instrumentSimulated: p.instrumentSimulated ?? 0,
    dayLandings: p.dayLandings ?? 0,
    nightLandings: p.nightLandings ?? 0,
    approaches: p.approaches ?? 0,
    holds: p.holds ?? 0,
    isSim: true,
    remarks: p.remarks,
    createdAt: now,
    updatedAt: now,
  };
}

function base64UrlDecode(s: string): string {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  if (typeof atob === "function") {
    const bin = atob(padded);
    return decodeURIComponent(
      Array.from(bin)
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
  }
  // React Native (Hermes has no atob in some builds): Buffer is polyfilled by RN.
  return (globalThis as unknown as { Buffer: { from(s: string, e: string): { toString(e: string): string } } }).Buffer.from(
    padded,
    "base64",
  ).toString("utf-8");
}

/** Parse a flightjournal://import-sim?data=<base64url JSON> deep link. */
export function parseSimImportUrl(
  url: string,
): { ok: true; payload: SimFlightPayload } | { ok: false; errors: string[] } {
  try {
    const match = url.match(/[?&]data=([^&]+)/);
    if (!match) return { ok: false, errors: ["No data parameter in the link."] };
    const json = base64UrlDecode(decodeURIComponent(match[1]));
    return validateSimPayload(JSON.parse(json));
  } catch {
    return { ok: false, errors: ["Could not read the sim flight data."] };
  }
}
