/**
 * Pro — macOS variant (Metro resolves this file instead of lib/pro.ts
 * for platform === 'macos'; iOS/Android/web are untouched).
 *
 * react-native-iap has no react-native-macos build, so the IAP-backed
 * implementation cannot run on macOS. This variant exposes the EXACT
 * same module API with the store permanently disconnected — which is
 * precisely lib/pro.ts's current shipping behavior anyway: no store
 * products exist yet ("demo mode"), buy/restore report "unavailable",
 * and Pro is NEVER granted for free (Joey's standing rule). The local
 * Pro flag store (AsyncStorage + useSyncExternalStore single source of
 * truth) is identical, so every screen and feature gate behaves the
 * same as on iOS today.
 *
 * SKUs use the iOS product IDs: the Mac app ships under the same App
 * Store Connect record (universal purchase), so when Mac IAP support
 * lands, these are the product IDs it will query.
 *
 * MAINTENANCE: if lib/pro.ts gains an export, add it here too.
 */
import { useEffect, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FREE_ENTRY_LIMIT } from "./types";

const IOS_SKUS = ["flightjournal.pro.monthly", "flightjournal.pro.yearly", "flightjournal.pro"];
const ANDROID_SKUS = ["flightjournal.pro.monthly", "flightjournal.pro.yearly", "flightjournal.pro"];

export const SKUS = IOS_SKUS;

export const LIFETIME_SKU = "flightjournal.pro";

export const SKU_NAMES: Record<string, string> = {
  "flightjournal.pro.monthly": "Pro Monthly",
  "flightjournal.pro.yearly": "Pro Yearly",
  "flightjournal.pro": "Pro Lifetime",
};

export const SKU_PRICES: Record<string, string> = {
  "flightjournal.pro.monthly": "$4.99/mo",
  "flightjournal.pro.yearly": "$49.99/yr",
  "flightjournal.pro": "$99.99 once",
};

/** Shared copy for the demo-mode (no store products yet) state. */
export const PRO_NOT_ON_SALE_TITLE = "Pro isn't on sale yet";
export const PRO_NOT_ON_SALE_MESSAGE =
  "Purchases open when Flight Journal launches in the app stores.";
export const PRO_NOTHING_TO_RESTORE_TITLE = "Nothing to restore yet";
export const PRO_NOTHING_TO_RESTORE_MESSAGE =
  "Pro purchases open when Flight Journal launches in the app stores.";

const PRO_KEY = "flightjournal:pro:v1";

export async function loadProLocal(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PRO_KEY)) === "1";
  } catch {
    return false;
  }
}

async function saveProLocal(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PRO_KEY, value ? "1" : "0");
  } catch {
    // Best-effort.
  }
}

// ---- Shared Pro state: the single source of truth (mirrors lib/pro.ts) ----

let proSnapshot = false;
let proLoadStarted = false;
const proSubscribers = new Set<() => void>();

function emitPro() {
  proSubscribers.forEach((cb) => cb());
}

function subscribePro(cb: () => void) {
  proSubscribers.add(cb);
  return () => {
    proSubscribers.delete(cb);
  };
}

function getProSnapshot() {
  return proSnapshot;
}

function ensureProLoaded() {
  if (proLoadStarted) return;
  proLoadStarted = true;
  void loadProLocal().then((v) => {
    if (v !== proSnapshot) {
      proSnapshot = v;
      emitPro();
    }
  });
}

/** The single write path into the Pro store — mirrors lib/pro.ts;
 * the owner unlock (lib/owner.ts) drives Pro through here too. */
export async function setPro(value: boolean): Promise<void> {
  if (proSnapshot !== value) {
    proSnapshot = value;
    emitPro();
  }
  await saveProLocal(value);
}

// ---- Purchase / restore results ----

/** "unavailable" = demo mode: no store products exist yet, nothing was
 * charged and Pro was NOT granted. */
export type BuyResult = "purchased" | "unavailable" | "failed";
export type RestoreResult = "restored" | "none" | "unavailable";

/** Minimal product shape — the fields app/pro.tsx reads (`id`). */
export type MacProduct = { id: string };

export function usePro() {
  const isPro = useSyncExternalStore(subscribePro, getProSnapshot, getProSnapshot);

  useEffect(() => {
    ensureProLoaded();
  }, []);

  return {
    isPro,
    // No StoreKit bridge on macOS: permanently "not connected", which
    // lib/pro.ts's screens already render as the not-on-sale state.
    connected: false,
    products: [] as MacProduct[],
    busySku: null as string | null,
    error: null as string | null,
    refreshProducts: async (): Promise<void> => {
      // No store to refresh from on macOS.
    },
    buy: async (_sku: string): Promise<BuyResult> => "unavailable",
    restore: async (): Promise<RestoreResult> => "unavailable",
  };
}

/** Subscriptions (Monthly / Yearly) carry the 7-day free trial.
 * Lifetime is a one-time purchase — no trial. */
export function isSubscriptionSku(sku: string): boolean {
  return sku !== LIFETIME_SKU;
}

/** Free tier: FREE_ENTRY_LIMIT entries, no export. Pro: unlimited entries + PDF/CSV export. */
export function canAddEntry(isPro: boolean, entryCount: number): boolean {
  return isPro || entryCount < FREE_ENTRY_LIMIT;
}

// Keep the Android SKU table referenced so this file stays a drop-in
// mirror of lib/pro.ts's constants.
void ANDROID_SKUS;
