/**
 * Profile — STUB for now (Nov 24, 2026).
 *
 * The old implementation read/wrote a row in Supabase public.profiles,
 * but Flight Journal has no Supabase backend (eas.json only ever had
 * placeholder values) and the Firebase data layer does not exist yet:
 * sign-in moved to Firebase Auth, while the logbook still runs on
 * local demo data (see lib/store.tsx). So these are no-ops until the
 * Firestore profile/data migration lands — at which point ensureProfile
 * should create the Firestore `profiles/{uid}` doc, getProfile should
 * read it, and updateProfile should write the display name there.
 *
 * Signatures are unchanged so the screens keep compiling: settings.tsx
 * reads the profile (gets null → shows no display name) and saves
 * edits (silently dropped for now).
 */

export interface Profile {
  userId: string;
  email: string;
  displayName: string | null;
}

/** No-op until the Firestore profile migration lands. */
export async function ensureProfile(_userId: string, _email: string): Promise<void> {
  return;
}

/** No profile store yet — always null. */
export async function getProfile(_userId: string): Promise<Profile | null> {
  return null;
}

/** No-op until the Firestore profile migration lands. */
export async function updateProfile(
  _userId: string,
  _patch: { display_name?: string | null },
): Promise<void> {
  return;
}
