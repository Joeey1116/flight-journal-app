# Flight Journal — v1 scaffold

A full, detailed pilot logbook for airline pilots and sim pilots.
Dark cockpit theme. Local-first with Supabase cloud sync (Pro).

> **Name: "Flight Journal" — FINAL, approved by Joey Nov 15, 2026.**
> Bundle ID `com.beatrackfaminc.flightjournal`, scheme `flightjournal`,
> slug `flight-journal-app`. (Earlier candidates "Skybug Logbook" and
> "Pilot Ledger" were rejected / taken.)

## What v1 does

- **Logbook entries** — date, aircraft type + model + registration,
  departure/arrival (ICAO), route, block times (out/off/on/in), time
  broken out (total, PIC, SIC, dual received/given, solo, cross-country,
  night, instrument actual + simulated), day/night landings, instrument
  approaches, holds, remarks. A **sim flight flag** keeps simulator time
  separate from real-aircraft totals.
- **Auto-totals** — running totals by category, by aircraft type,
  last-90-days window, hours-by-month.
- **Currency (FAR 61.57 / 61.56)** — 90-day day/night landing currency,
  6-calendar-month instrument currency (approaches + holds), flight
  review (24 calendar months), medical expiry — with due-date warnings.
- **Stats** — total hours, hours by type, ATP minimums ladder
  (FAA 61.159: 1500 total / 500 XC / 100 night / 75 instrument /
  250 PIC / 50 multi-engine).
- **Export (Pro)** — PDF in traditional printed-logbook format
  (totals row + signature line) and CSV (imports into LogTen,
  ForeFlight, MyFlightbook, or a spreadsheet).
- **Accounts + cloud sync (Pro)** — Supabase auth (email + Apple
  sign-in); local-first AsyncStorage, sync stub ready for a real project.
- **Companion-sim import** — a defined JSON contract (see
  `docs/SIM-IMPORT-CONTRACT.md`) so flights from Joey's companion flight
  simulator can auto-log as sim flights. Deep link:
  `flightjournal://import-sim?data=<base64url JSON>`, or paste JSON in
  More → Import a sim flight.
- **Free + Pro** — free: 25 entries, on-device. Pro: unlimited entries,
  export, cloud sync, advanced stats. IAP structure follows Motivation's
  react-native-iap v17 pattern; **product IDs are placeholders** —
  Joey creates the real ones in App Store Connect / Play Console.

## Stack (copied 1:1 from Snugbug / Hugbug)

Expo ~57.0.26 · expo-router ~57.0.24 · react-native-screens ~4.26.0 ·
React 19.2.3 · RN 0.86.3 · TypeScript ~6.0.3 · @supabase/supabase-js
^2.39.0 · AsyncStorage 2.2.0 · react-native-iap ^17.0.1 ·
expo-file-system · expo-sharing · expo-print.

## Layout

- `app/(tabs)/` — Dashboard, Logbook, Currency, Stats, More
  (NativeTabs, cyan accent on near-black).
- `app/entry/new.tsx`, `app/entry/[id].tsx` — new/edit/detail.
- `app/aircraft.tsx`, `app/qualifications.tsx`, `app/export.tsx`,
  `app/pro.tsx`, `app/settings.tsx`, `app/onboarding.tsx`.
- `lib/types.ts` — entry/aircraft/qualification models.
- `lib/totals.ts` — sums, windows, ATP ladder, hours-per-month.
- `lib/currency.ts` — FAR 61.57(a)/(b)/(c), 61.56, medical.
- `lib/export.ts` — CSV builder, logbook-format PDF HTML, share.
- `lib/sim-import.ts` — companion-sim import contract + validator.
- `lib/pro.ts` — IAP (Motivation pattern, placeholder SKUs).
- `lib/store.tsx` — AsyncStorage store + Supabase sync stub.
- `lib/seed.ts` — clearly-marked demo flights (first launch only).
- `supabase/migrations/001_flight_journal.sql` — profiles,
  logbook_entries, aircraft, qualifications (RLS per user).

## Before a first device build

1. **Name — FINAL: "Flight Journal"** (approved by Joey Nov 15, 2026).
   app.json/eas.json already carry it (bundle
   `com.beatrackfaminc.flightjournal`, scheme `flightjournal`).
2. **Supabase project** — create it, run the migration, replace the
   placeholder URL/anon key in eas.json (same pattern as Snugbug/Hugbug).
3. **IAP products** — create the three Pro SKUs in App Store Connect /
   Play Console (IDs in `lib/pro.ts`).
4. **GitHub repo** — create the public repo; Joey adds a new deploy
   keypair (`id_ed25519_flightjournal`, read/write) — see BUILD-NOTES.md.
5. **App Store Connect record** — Joey creates the app record (the
   ios-build.yml header notes the ASC record and clip App ID don't
   exist yet).

## Commands

```sh
npm install
npm run typecheck   # tsc --noEmit
npm run web         # Expo web preview
```

## How it compares

See `docs/COMPETITIVE-NOTES.md` — v1 matches LogTen Pro / ForeFlight /
MyFlightbook on the core logbook job (full §61.51 fields, currency,
export) and beats them on sim-flight auto-logging and on being free
to start on iOS + Android + web.
