/**
 * Pro — in-app purchases, modeled 1:1 on Motivation's purchases.ts
 * (react-native-iap v17, event-based: requestPurchase resolves nothing —
 * the outcome arrives through purchaseUpdatedListener).
 *
 * The product IDs below match App Store Connect (Joey created the
 * Lifetime product there as "flightjournal.pro"); the Play Console
 * products will use the same IDs. Until the products are live there is NO
 * store connection ("demo mode"): products resolve to their local
 * fallback info, and — per Joey's explicit direction — the paywall
 * must NOT grant Pro for free. Buy/restore report "unavailable" and
 * the screens explain that purchases open at store launch. When real
 * products exist, the react-native-iap flow below takes over,
 * including the stores' real 7-day introductory trial.
 *
 * Pro STATE is single-sourced: one module-level store (persisted to
 * AsyncStorage) that every screen reads through useSyncExternalStore,
 * so the paywall, More, Settings, and every feature gate always agree
 * and update live — previously each screen kept its own copy loaded
 * on mount, and the More tab didn't read Pro state at all.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useIAP,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases as queryAvailablePurchases,
  isUserCancelledError,
  type Product,
  type Purchase,
  type PurchaseError,
} from "react-native-iap";
import { FREE_ENTRY_LIMIT } from "./types";

// Product IDs match App Store Connect: Joey created the Lifetime
// non-consumable there as "flightjournal.pro" (reference name
// "Flight Journal Pro"); Monthly/Yearly follow the same scheme.
// TODO: create the same IDs in Play Console after uploading a build
// with billing.
const IOS_SKUS = ["flightjournal.pro.monthly", "flightjournal.pro.yearly", "flightjournal.pro"];
const ANDROID_SKUS = ["flightjournal.pro.monthly", "flightjournal.pro.yearly", "flightjournal.pro"];

export const SKUS = Platform.OS === "ios" ? IOS_SKUS : ANDROID_SKUS;

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

type PendingPurchase = { sku: string; resolve: (ok: boolean) => void };
let pendingPurchase: PendingPurchase | null = null;
let globalListenersAttached = false;
let finishTxRef: ((args: { purchase: Purchase; isConsumable?: boolean }) => Promise<void>) | null = null;

function settlePending(ok: boolean) {
  const p = pendingPurchase;
  pendingPurchase = null;
  if (p) p.resolve(ok);
}

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

// ---- Shared Pro state: the single source of truth ----

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

/**
 * The single write path into the Pro store — purchase and restore
 * flows call it, and so does the device-local owner unlock
 * (lib/owner.ts), which turns Pro on/off through here rather than
 * keeping any Pro flag of its own. Every gate reads the snapshot
 * this updates, so all of them agree the moment it changes.
 */
export async function setPro(value: boolean): Promise<void> {
  if (proSnapshot !== value) {
    proSnapshot = value;
    emitPro();
  }
  await saveProLocal(value);
}

function useSharedPro(): boolean {
  const isPro = useSyncExternalStore(subscribePro, getProSnapshot, getProSnapshot);
  useEffect(() => {
    ensureProLoaded();
  }, []);
  return isPro;
}

// ---- Purchase / restore results ----

/** "unavailable" = demo mode: no store products exist yet, nothing was
 * charged and Pro was NOT granted. */
export type BuyResult = "purchased" | "unavailable" | "failed";
export type RestoreResult = "restored" | "none" | "unavailable";

export function usePro() {
  const { connected, products, requestPurchase, finishTransaction, fetchProducts } =
    useIAP();
  const isPro = useSharedPro();
  const [busySku, setBusySku] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    finishTxRef = finishTransaction;
  }, [finishTransaction]);

  useEffect(() => {
    if (globalListenersAttached) return;
    globalListenersAttached = true;
    const updated = purchaseUpdatedListener(async (purchase: Purchase) => {
      try {
        await finishTxRef?.({ purchase, isConsumable: false });
        if (SKUS.includes(purchase.productId)) {
          await setPro(true);
        }
        settlePending(true);
      } catch {
        settlePending(false);
      }
    });
    const failed = purchaseErrorListener((e: PurchaseError) => {
      if (isUserCancelledError(e)) {
        settlePending(false);
        return;
      }
      if (mounted.current) setError(e.message ?? "Purchase failed.");
      settlePending(false);
    });
    return () => {
      updated.remove();
      failed.remove();
      globalListenersAttached = false;
    };
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      await fetchProducts({ skus: SKUS });
    } catch {
      // Demo mode: products stay empty; fallback info is used instead.
    }
  }, [fetchProducts]);

  const buy = useCallback(
    async (sku: string): Promise<BuyResult> => {
      setError(null);
      if (!connected) {
        // Demo mode — no store products exist yet. NEVER grant Pro
        // here (Joey: "I want people to pay. I don't want it to just
        // give people the free option."). The caller explains the
        // not-on-sale state to the user.
        return "unavailable";
      }
      setBusySku(sku);
      try {
        const result = new Promise<boolean>((resolve) => {
          pendingPurchase = { sku, resolve };
        });
        await requestPurchase({ request: { apple: { sku }, google: { skus: [sku] } } } as never);
        return (await result) ? "purchased" : "failed";
      } catch (e) {
        const err = e as { message?: string };
        if (mounted.current) setError(err?.message ?? "Purchase failed.");
        return "failed";
      } finally {
        if (mounted.current) setBusySku(null);
      }
    },
    [connected, requestPurchase],
  );

  const restore = useCallback(async (): Promise<RestoreResult> => {
    if (!connected) {
      // Demo mode: there is no store to restore from.
      return "unavailable";
    }
    try {
      const purchases = await queryAvailablePurchases();
      const owned = purchases.some((p) => SKUS.includes(p.productId));
      if (owned) {
        await setPro(true);
        return "restored";
      }
      return "none";
    } catch {
      return (await loadProLocal()) ? "restored" : "none";
    }
  }, [connected]);

  return {
    isPro,
    connected,
    products: products as Product[],
    busySku,
    error,
    refreshProducts,
    buy,
    restore,
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
