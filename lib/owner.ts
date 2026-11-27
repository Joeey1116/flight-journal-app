/**
 * Device-local owner unlock.
 *
 * Scope: on this one device it lifts the free entry-count cap AND
 * turns Pro on (export, ATP tracker, sim import — every Pro gate),
 * per Joey's explicit direction. Pro is NOT a second flag here: the
 * toggle drives lib/pro.ts's single-sourced Pro store through its
 * setPro() write path, the same one purchases and restores use, so
 * every screen and gate agrees. Toggling the unlock off turns both
 * back off together. It shows no label anywhere.
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
import { setPro } from "./pro";

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
        // Keep the invariant across restarts (incl. devices where a
        // pre-Pro build of this unlock persisted the flag on its
        // own): owner on means Pro on, via the same write path.
        void setPro(true);
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
    // Pro follows the unlock, through lib/pro.ts's own write path —
    // no separate Pro state lives here.
    await setPro(on);
  } catch {
    // Best-effort; the in-memory state is already updated.
  }
}
