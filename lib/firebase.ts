import { getApp, type FirebaseApp } from '@react-native-firebase/app';
import { getAuth, type Auth } from '@react-native-firebase/auth';

/**
 * Firebase — the Flight Journal backend (Nov 24, 2026: sign-in moved
 * from Supabase placeholders to Firebase Auth, following the Nov 15
 * decision that one Firebase project, "BeaTrackFam Apps" (Spark/free
 * plan), holds all the new apps. Same project as Hugbug.
 *
 * The native config files live at the repo root (google-services.json
 * for Android, GoogleService-Info.plist for iOS) and are wired into the
 * native projects by the @react-native-firebase/app config plugin at
 * prebuild time. Auth providers enabled in the console: Apple +
 * email/password. (Google sign-in is Hugbug-only; Flight Journal does
 * not offer it.)
 *
 * Auth only for now: the logbook data layer still runs on local demo
 * data (see lib/store.tsx) — the Firestore profile/data migration is a
 * separate next step.
 */

// The native SDK auto-registers the default app from the bundled config
// files (GoogleService-Info.plist / google-services.json) at launch,
// before JS runs — getApp() is the normal path, no explicit initialize.
const app: FirebaseApp = getApp();

export const firebaseApp: FirebaseApp = app;
export const firebaseAuth: Auth = getAuth(app);
