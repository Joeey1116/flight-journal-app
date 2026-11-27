/**
 * Flight Journal data model.
 *
 * Field set follows FAA 14 CFR 61.51 (what must be logged) and the columns
 * every leading logbook app offers (LogTen Pro, ForeFlight, MyFlightbook):
 * date, aircraft type + tail, route, block times (Out/Off/On/In), time
 * broken out by role and condition, landings, approaches, holds, remarks.
 * Times are decimal hours (1.5 = 1h30m), matching how pilots log.
 */

export interface LogbookEntry {
  id: string;
  /** YYYY-MM-DD (local date of the flight). */
  date: string;
  /** Aircraft type code, e.g. C172, B738, A320. */
  aircraftType: string;
  /** Aircraft model, e.g. "Cessna 172S", "Boeing 737-800". */
  aircraftModel: string;
  /** Tail / registration, e.g. N12345. */
  registration: string;
  /** Departure airport ICAO, e.g. KJFK. */
  departure: string;
  /** Arrival airport ICAO, e.g. KLAX. */
  arrival: string;
  /** Full route string, e.g. "KJFK DCT KLAX" (optional). */
  route?: string;
  /** Block out / off / on / in times, HH:MM (optional — total time is king). */
  outTime?: string;
  offTime?: string;
  onTime?: string;
  inTime?: string;
  /** Decimal hours. */
  totalTime: number;
  pic: number;
  sic: number;
  dualReceived: number;
  dualGiven: number;
  solo: number;
  crossCountry: number;
  night: number;
  instrumentActual: number;
  instrumentSimulated: number;
  dayLandings: number;
  nightLandings: number;
  /** Instrument approaches flown. */
  approaches: number;
  /** Holding procedures flown. */
  holds: number;
  /** True for flights flown in a simulator (including the companion sim). */
  isSim: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

/** Numeric time/count fields that sum into totals. */
export const TIME_FIELDS = [
  "totalTime",
  "pic",
  "sic",
  "dualReceived",
  "dualGiven",
  "solo",
  "crossCountry",
  "night",
  "instrumentActual",
  "instrumentSimulated",
  "dayLandings",
  "nightLandings",
  "approaches",
  "holds",
] as const;

export type TimeField = (typeof TIME_FIELDS)[number];

export type Totals = Record<TimeField, number>;

export function emptyTotals(): Totals {
  const t = {} as Totals;
  for (const f of TIME_FIELDS) t[f] = 0;
  return t;
}

export interface Aircraft {
  id: string;
  /** Type code, e.g. C172. */
  type: string;
  model: string;
  registration: string;
  category: "ASEL" | "AMEL" | "ASES" | "AMES" | "HELI" | "GLIDER" | "OTHER";
  engine: "piston" | "turboprop" | "jet" | "electric" | "none";
  multiEngine: boolean;
  turbine: boolean;
  complex: boolean;
  tailwheel: boolean;
  notes?: string;
}

export type QualificationKind =
  | "medical"
  | "flightReview"
  | "ipc"
  | "rating"
  | "endorsement"
  | "certificate"
  | "other";

export interface Qualification {
  id: string;
  kind: QualificationKind;
  /** e.g. "First Class Medical", "Flight Review", "Instrument Rating". */
  name: string;
  /** YYYY-MM-DD. */
  issuedDate: string;
  /** YYYY-MM-DD (optional for ratings/certificates that don't expire). */
  expiryDate?: string;
  notes?: string;
}

/** Free-tier limits (Pro removes them). ONE place to change the cap. */
export const FREE_ENTRY_LIMIT = 100;

export function newEntryId(): string {
  return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
