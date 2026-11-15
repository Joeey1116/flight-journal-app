# Competitive notes — pilot logbook apps

Research done Nov 15, 2026 (public product pages + reviews).
Used to design v1 so it matches or beats the leaders on the core
logbook job.

## LogTen Pro (Coradine) — the gold standard

- iOS + macOS only. $79.99/yr (or $129.99/yr Pro). Free until 50 hours.
- Fields: PIC/SIC/dual/instrument/night/XC + custom fields; 160k+ pilots.
- Currency: fully customizable rules; 100+ reports incl. FAA 8710
  (airman application) and airline interview reports.
- Airline schedule import from 100+ airlines; FAR 117 duty/rest.
- Weaknesses: no Android, no web, expensive, no sim-flight auto-log.

## ForeFlight Logbook

- Inside the ForeFlight subscription (iOS + web). Cloud-backed.
- Auto night time + landings from Out/Off/On/In times; track-log
  integration; custom fields; qualifications; experience + detail
  print reports; auto monthly PDF/CSV email export.
- Weaknesses: locked inside a paid ForeFlight subscription; no
  standalone Android app; no sim-flight auto-log.

## MyFlightbook

- Free. iOS + Android + web. GPS auto-detect of flights.
- CSV import/export; custom currency rules; endorsements.
- Weaknesses: dated UI; no native PDF print format; no sim-flight
  auto-log.

## Others noted

- Safelog ($39.99, 70k airports), ZuluLog (free), CrewLounge PILOTLOG
  (€39.99–46.99/yr), Jetlog, Daedalus (FAA §61.51 categories,
  DPE-ready PDF).

## Where v1 stands

| Feature | LogTen Pro | ForeFlight | MyFlightbook | This app (v1) |
|---|---|---|---|---|
| Full §61.51 fields (PIC/SIC/XC/night/instr/dual/solo) | ✓ | ✓ | ✓ | ✓ |
| Out/Off/On/In block times | ✓ | ✓ | ✓ | ✓ |
| Day + night landing currency (90-day) | ✓ | ✓ | ✓ | ✓ |
| Instrument currency (6-mo approaches/holds) | ✓ | ✓ | ✓ | ✓ |
| Flight review / medical due dates | ✓ | ✓ | ✓ | ✓ |
| Auto-totals by type / window | ✓ | ✓ | ✓ | ✓ |
| ATP minimums ladder | ✓ (reports) | partial | — | ✓ built in |
| PDF export (logbook format) | ✓ | ✓ | — | ✓ |
| CSV export | ✓ | ✓ | ✓ | ✓ |
| iOS + Android + web | iOS only | iOS + web | ✓ | ✓ |
| Sim-flight auto-logging | — | — | — | ✓ (designed) |
| Free core tier | 50 hrs | — | ✓ | 25 entries |

## Differentiators to protect

1. **Sim-flight auto-logging** — no competitor has it; it's the
   tie-in with Joey's companion flight simulator.
2. **Free core on all three platforms** — LogTen is iOS-only and
   $80/yr; ForeFlight needs the full subscription.
3. **Modern UI** — MyFlightbook is free but dated; v1 is a clean
   dark cockpit theme.

## Still missing vs the leaders (future versions)

- Airline schedule import (LogTen's 100+ airlines).
- FAA 8710 / airline-interview report formats.
- Custom currency rules (MyFlightbook/LogTen).
- GPS auto-detect of flights (MyFlightbook).
- FAR 117 duty/rest tracking (LogTen Pro).
- iPad / macOS optimization.
