# Build notes — Flight Journal

## Status

v1 scaffold, local only. Typecheck passes. Web preview smoke-tested.
**No store submission, no App Store Connect, no TestFlight attempted.**

This scaffold was cloned from the Snugbug kit and rewritten as a pilot
logbook — the old AI-companion code (chat, companion, voice, tasks,
allowance) was removed. Anything still referencing it is a leftover to
delete, not a feature.

## Build system

- GitHub Actions iOS + Android workflows mirror Snugbug/Hugbug,
  including `.github/scripts/bump-build-number.py` (+1 iOS buildNumber
  + Android versionCode in sync, commit-back with
  `git pull --rebase --autostash`).
- Joey runs the workflows and the store uploads himself.

## Known TODOs before the first device build

1. **Name — FINAL: "Flight Journal"** (approved by Joey Nov 15, 2026).
   app.json / eas.json now carry the final name, slug
   `flight-journal-app`, bundle ID `com.beatrackfaminc.flightjournal`,
   and scheme `flightjournal`. The clip's `appStoreID` is still a TODO
   until Joey creates the App Store Connect record.
2. **App Store Connect record** — does not exist yet; Joey creates it.
   The clip App ID does not exist in the portal yet either.
3. **Supabase project** — create it, run
   `supabase/migrations/001_flight_journal.sql`, replace the placeholder
   URL/anon key in eas.json.
4. **IAP products** — create the three Pro SKUs in App Store Connect /
   Play Console (see `lib/pro.ts` TODOs). Until then purchases run in
   demo mode (simulated locally).
5. **GitHub repo** — create the public repo. New deploy keypair
   `id_ed25519_flightjournal` (read/write) — Joey adds it to the repo;
   push with `GIT_SSH_COMMAND='ssh -i /home/hatch/.ssh/id_ed25519_flightjournal
   -o UserKnownHostsFile=/home/hatch/.ssh/known_hosts'`.
6. **Icon** — generated placeholder (dark bg, white/cyan plane glyph)
   in `assets/`; Joey will want a real icon later.
7. **Cloud sync** — `syncToCloud()` in `lib/store.tsx` upserts entries
   once a real project is configured; aircraft/qualifications sync
   is still a stub (local-only until then).
8. **Deep link** — `flightjournal://import-sim` is wired in
   `lib/sim-import.ts` (`parseSimImportUrl`); the root `_layout.tsx`
   does not yet route incoming links to the import flow — wire it when
   the companion sim ships its export side.

## Patterns copied from Snugbug / Hugbug

- Expo ~57.0.26, expo-router ~57.0.24, react-native-screens ~4.26.0,
  NativeTabs (5 tabs, cyan `#22D3EE` accent, `#05070D` background).
- `lib/supabase.ts` placeholder detection, PKCE, AsyncStorage.
- `lib/auth.tsx`, `app/sign-in|sign-up|reset-password` (generic auth).
- IAP: Motivation's `lib/purchases.ts` event-based pattern
  (react-native-iap v17).
- App Clip: pure SwiftUI (no React Native — 15 MB limit), clip
  entitlements need both `appclips:beatrackfam.info` and
  `applinks:beatrackfam.info`; embed phase dstPath must be explicit
  `$(CONTENTS_FOLDER_PATH)/AppClips` + dstSubfolderSpec 16.

## Decisions

- Local-first: the logbook works fully offline; cloud is a Pro sync
  layer, not a dependency. (A pilot's logbook must never be hostage
  to a network.)
- Sim time is always separate: `isSim` flights never count toward
  real-aircraft totals or day/night currency — they have their own
  totals (same convention ForeFlight/LogTen use).
- Night landings are counted as full-stop (FAR 61.57(b) requirement);
  the Currency tab says so, and the entry form notes it.
- Instrument currency tracks approaches + holds; the intercept/track
  element of 61.57(c) is pilot-verified and stated as such in the UI.
- Free tier is 25 entries; export + cloud sync + unlimited are Pro.
