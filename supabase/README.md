# Supabase — Flight Journal

## One-time setup (Joey)

1. **Create a Supabase project** (free tier) at https://supabase.com/dashboard — a NEW project for Flight Journal. Do NOT reuse another app's Supabase project (different app, separate users).
2. **Run the migration:** in the project, open the SQL Editor and run `supabase/migrations/001_flight_journal.sql` (creates `profiles`, `logbook_entries`, `aircraft`, `qualifications` with RLS — each user sees only their own rows).
3. **Wire the app:** put the project's URL + anon key in `eas.json` (all three profiles) — they are public keys, safe to ship in the bundle.
4. **Auth settings** (dashboard → Authentication):
   - Enable Email provider; set the Site URL / redirect allowlist to include `flightjournal://confirmed` and `flightjournal://reset-password`.
   - Enable Apple provider ("Sign in with Apple") for the Apple button — needs the Apple Service ID + key from Apple Developer.

## How sync works

The app is local-first: entries, aircraft, and qualifications live in
AsyncStorage and work fully offline. When a real project is configured,
`syncToCloud()` in `lib/store.tsx` upserts the local entries to
`logbook_entries` (keyed by entry id + user id). Cloud sync is a Pro
feature; aircraft/qualifications cloud sync is still a stub — local-only
until it is wired.

## No Edge Functions

This app has no Edge Functions and no AI backend. Do not deploy any
`flightjournal-chat` function — that was the old Snugbug-clone scaffold
and no longer exists.
