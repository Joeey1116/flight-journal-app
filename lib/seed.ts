/**
 * Demo seed data — clearly-marked demo flights so the dashboard,
 * currency, and stats screens show real-looking content on first run.
 * The user can clear all demo data from More → Clear demo data.
 * Never shipped as the user's real logbook: seed only runs when the
 * store is completely empty AND no account has ever signed in.
 */
import type { Aircraft, LogbookEntry, Qualification } from "./types";

const now = new Date().toISOString();

function entry(
  partial: Omit<LogbookEntry, "id" | "createdAt" | "updatedAt">,
  id: string,
): LogbookEntry {
  return { ...partial, id, createdAt: now, updatedAt: now };
}

export const SEED_AIRCRAFT: Aircraft[] = [
  {
    id: "ac_c172",
    type: "C172",
    model: "Cessna 172S Skyhawk",
    registration: "N12345",
    category: "ASEL",
    engine: "piston",
    multiEngine: false,
    turbine: false,
    complex: false,
    tailwheel: false,
  },
  {
    id: "ac_b738",
    type: "B738",
    model: "Boeing 737-800",
    registration: "N78901",
    category: "AMEL",
    engine: "jet",
    multiEngine: true,
    turbine: true,
    complex: true,
    tailwheel: false,
  },
];

export const SEED_QUALIFICATIONS: Qualification[] = [
  {
    id: "q_med",
    kind: "medical",
    name: "First Class Medical",
    issuedDate: "2026-03-15",
    expiryDate: "2027-03-31",
  },
  {
    id: "q_bfr",
    kind: "flightReview",
    name: "Flight Review",
    issuedDate: "2025-06-10",
    expiryDate: "2027-06-30",
  },
  {
    id: "q_ir",
    kind: "rating",
    name: "Instrument Rating — Airplane",
    issuedDate: "2024-11-02",
  },
];

export const SEED_ENTRIES: LogbookEntry[] = [
  entry(
    {
      date: "2026-11-14", aircraftType: "C172", aircraftModel: "Cessna 172S Skyhawk",
      registration: "N12345", departure: "KFRG", arrival: "KFRG",
      route: "KFRG local", totalTime: 1.2, pic: 1.2, sic: 0, dualReceived: 0,
      dualGiven: 0, solo: 0, crossCountry: 0, night: 0, instrumentActual: 0,
      instrumentSimulated: 0.4, dayLandings: 3, nightLandings: 0, approaches: 2,
      holds: 1, isSim: false, remarks: "Pattern work + hood",
    },
    "seed_1",
  ),
  entry(
    {
      date: "2026-11-12", aircraftType: "C172", aircraftModel: "Cessna 172S Skyhawk",
      registration: "N12345", departure: "KFRG", arrival: "KHPN",
      route: "KFRG KHPN", totalTime: 0.9, pic: 0.9, sic: 0, dualReceived: 0,
      dualGiven: 0, solo: 0, crossCountry: 0.9, night: 0, instrumentActual: 0,
      instrumentSimulated: 0, dayLandings: 1, nightLandings: 0, approaches: 0,
      holds: 0, isSim: false, remarks: "Night stop — dinner run",
    },
    "seed_2",
  ),
  entry(
    {
      date: "2026-11-10", aircraftType: "B738", aircraftModel: "Boeing 737-800",
      registration: "N78901", departure: "KJFK", arrival: "KMIA",
      route: "KJFK KMIA", totalTime: 2.8, pic: 0, sic: 2.8, dualReceived: 0,
      dualGiven: 0, solo: 0, crossCountry: 2.8, night: 0.6, instrumentActual: 0.3,
      instrumentSimulated: 0, dayLandings: 1, nightLandings: 0, approaches: 1,
      holds: 0, isSim: false, remarks: "Line flight",
    },
    "seed_3",
  ),
  entry(
    {
      date: "2026-11-08", aircraftType: "B738", aircraftModel: "Boeing 737-800",
      registration: "N78901", departure: "KMIA", arrival: "KJFK",
      route: "KMIA KJFK", totalTime: 2.7, pic: 2.7, sic: 0, dualReceived: 0,
      dualGiven: 0, solo: 0, crossCountry: 2.7, night: 1.1, instrumentActual: 0.2,
      instrumentSimulated: 0, dayLandings: 0, nightLandings: 1, approaches: 1,
      holds: 1, isSim: false, remarks: "Night return",
    },
    "seed_4",
  ),
  entry(
    {
      date: "2026-11-05", aircraftType: "C172", aircraftModel: "Cessna 172S Skyhawk",
      registration: "N12345", departure: "KFRG", arrival: "KISP",
      route: "KFRG KISP", totalTime: 1.4, pic: 1.4, sic: 0, dualReceived: 0,
      dualGiven: 0, solo: 0, crossCountry: 1.4, night: 0, instrumentActual: 0,
      instrumentSimulated: 0.6, dayLandings: 2, nightLandings: 0, approaches: 1,
      holds: 0, isSim: false, remarks: "XC + approaches",
    },
    "seed_5",
  ),
  entry(
    {
      date: "2026-11-01", aircraftType: "B738", aircraftModel: "Boeing 737-800",
      registration: "N78901", departure: "KJFK", arrival: "KBOS",
      route: "KJFK KBOS", totalTime: 1.1, pic: 0, sic: 1.1, dualReceived: 0,
      dualGiven: 0, solo: 0, crossCountry: 1.1, night: 0, instrumentActual: 0,
      instrumentSimulated: 0, dayLandings: 1, nightLandings: 0, approaches: 1,
      holds: 0, isSim: true, remarks: "Sim session — companion sim",
    },
    "seed_6",
  ),
];
