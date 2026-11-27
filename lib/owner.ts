/**
 * Device-local owner unlock.
 *
 * Scope, deliberately tiny: it lifts ONLY the free entry-count cap on
 * this one device. It is NOT Pro — it touches no Pro state, unlocks no
 * Pro feature (export, ATP tracker, sim import stay exactly as gated),
 * and shows no label anywhere. It exists so the app's owner can log
 * without a cap on his own devices.
 *
 * There is intentionally no UI for it: no row, no menu, no copy. The
 * toggle is a hidden gesture on the More tab's version footer — seven
 * taps, then a long-press to confirm. The only visible trace when
 * active is a tiny trailing "•" on that version text, which means
 * nothing to anyone who doesn't already know.
 *
 * Stored locally (AsyncStorage / localStorage on web) — per device,
 * per browser, never synced, never sent anywhere.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

const OWNER_KEY = "flightjournal:owner:v1";

let ownerState = false;
let loadStarted = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function ensureLoaded(): void {
  if (loadStarted) return;
  loadStarted = true;
  AsyncStorage.getItem(OWNER_KEY)
    .then((v) => {
      if (v === "1" && !ownerState) {
        ownerState = true;
        emit();
      }
    })
    .catch(() => {
      // Best-effort; default is off.
    });
}

ensureLoaded();

export function isOwnerSync(): boolean {
  return ownerState;
}

export function useOwner(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ownerState,
    () => ownerState,
  );
}

export async function setOwner(on: boolean): Promise<void> {
  ownerState = on;
  emit();
  try {
    if (on) await AsyncStorage.setItem(OWNER_KEY, "1");
    else await AsyncStorage.removeItem(OWNER_KEY);
  } catch {
    // Best-effort; the in-memory state is already updated.
  }
}
