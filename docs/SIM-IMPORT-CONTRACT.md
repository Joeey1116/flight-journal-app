# Companion-sim import contract

How a flight flown in Joey's companion flight simulator (name TBD)
auto-logs into this logbook. The contract is a plain JSON payload so
either side can implement it without depending on the other's code.
No simulator name is hard-coded anywhere — the source is always
`"companion-sim"`.

## Transport

1. **Deep link (same device):**
   `flightjournal://import-sim?data=<base64url JSON>`
2. **Share / paste:** the same JSON object, pasted into
   More → Import a sim flight.

## Payload (JSON)

```json
{
  "schemaVersion": 1,
  "source": "companion-sim",
  "sessionId": "sim-2026-11-15-abc123",
  "date": "2026-11-15",
  "aircraftType": "C172",
  "aircraftModel": "Cessna 172S Skyhawk",
  "registration": "N12345",
  "departure": "KJFK",
  "arrival": "KBOS",
  "route": "KJFK KBOS",
  "totalTime": 1.1,
  "pic": 1.1,
  "night": 0.2,
  "instrumentSimulated": 0.3,
  "dayLandings": 1,
  "nightLandings": 0,
  "approaches": 1,
  "holds": 0,
  "remarks": "Sim session"
}
```

## Rules

- **Required:** `schemaVersion` (must be `1`), `source` (must be
  `"companion-sim"`), `sessionId`, `date` (YYYY-MM-DD), `aircraftType`,
  `aircraftModel`, `registration`, `departure` + `arrival` (4-letter
  ICAO), `totalTime` (number > 0).
- **Optional numbers** default to 0: `pic`, `night`,
  `instrumentSimulated`, `dayLandings`, `nightLandings`, `approaches`,
  `holds`.
- **Every imported flight is `isSim: true`.** It counts toward sim
  totals only — never toward real-aircraft totals or day/night
  currency. Cross-country, SIC, dual, and solo are always 0 on import.
- **`sessionId`** is the sim session id — the logbook uses it to
  de-duplicate re-imports of the same flight.
- **Validation:** `validateSimPayload()` in `lib/sim-import.ts`
  rejects bad payloads with a list of problems; nothing is partially
  imported. `parseSimImportUrl()` parses the deep-link form.
- **Still to wire:** the root `_layout.tsx` does not yet route an
  incoming `flightjournal://import-sim` link into the import flow —
  wire it when the companion sim ships its export side.
