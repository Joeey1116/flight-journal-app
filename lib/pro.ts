/**
 * Pro — in-app purchases, modeled 1:1 on Motivation's purchases.ts
 * (react-native-iap v17, event-based: requestPurchase resolves nothing —
 * the outcome arrives through purchaseUpdatedListener).
 *
 * TODO (Joey): create these exact product IDs in App Store Connect /
 * Play Console before wiring live purchases. Until then the hook runs
 * in demo mode — products resolve to their local fallback info and
 * purchases are simulated locally so every screen can be tested.
 * Do NOT wire real store products yet.
 */
import { useCallback, useEffect, useRef, useState } from "react";
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

// TODO: Joey creates these exact IDs in App Store Connect.
const IOS_SKUS = ["FLIGHTJOURNALPRO_MONTHLY", "FLIGHTJOURNALPRO_YEARLY", "FLIGHTJOURNALPRO_LIFETIME"];
// TODO: Joey creates these in Play Console after uploading a build with billing.
const ANDROID_SKUS = ["flightjournalpro_monthly", "flightjournalpro_yearly", "flightjournalpro_lifetime"];

export const SKUS = Platform.OS === "ios" ? IOS_SKUS : ANDROID_SKUS;

export const LIFETIME_SKU =
  Platform.OS === "ios" ? "FLIGHTJOURNALPRO_LIFETIME" : "flightjournalpro_lifetime";

export const SKU_NAMES: Record<string, string> = {
  FLIGHTJOURNALPRO_MONTHLY: "Pro Monthly",
  FLIGHTJOURNALPRO_YEARLY: "Pro Yearly",
  FLIGHTJOURNALPRO_LIFETIME: "Pro Lifetime",
  flightjournalpro_monthly: "Pro Monthly",
  flightjournalpro_yearly: "Pro Yearly",
  flightjournalpro_lifetime: "Pro Lifetime",
};

export const SKU_PRICES: Record<string, string> = {
  FLIGHTJOURNALPRO_MONTHLY: "$4.99/mo",
  FLIGHTJOURNALPRO_YEARLY: "$49.99/yr",
  FLIGHTJOURNALPRO_LIFETIME: "$99.99 once",
  flightjournalpro_monthly: "$4.99/mo",
  flightjournalpro_yearly: "$49.99/yr",
  flightjournalpro_lifetime: "$99.99 once",
};

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

export function usePro() {
  const { connected, products, requestPurchase, finishTransaction, fetchProducts } =
    useIAP();
  const [isPro, setIsPro] = useState(false);
  const [busySku, setBusySku] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    void loadProLocal().then((v) => {
      if (mounted.current) setIsPro(v);
    });
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
          await saveProLocal(true);
          if (mounted.current) setIsPro(true);
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
    async (sku: string): Promise<boolean> => {
      setError(null);
      setBusySku(sku);
      try {
        if (!connected) {
          // Demo mode (no store connection in this scaffold): simulate the
          // purchase locally so the Pro flow can be tested end to end.
          await new Promise((r) => setTimeout(r, 600));
          await saveProLocal(true);
          if (mounted.current) setIsPro(true);
          return true;
        }
        const result = new Promise<boolean>((resolve) => {
          pendingPurchase = { sku, resolve };
        });
        await requestPurchase({ request: { apple: { sku }, google: { skus: [sku] } } } as never);
        return await result;
      } catch (e) {
        const err = e as { message?: string };
        if (mounted.current) setError(err?.message ?? "Purchase failed.");
        return false;
      } finally {
        if (mounted.current) setBusySku(null);
      }
    },
    [connected, requestPurchase],
  );

  const restore = useCallback(async (): Promise<boolean> => {
    try {
      const purchases = await queryAvailablePurchases();
      const owned = purchases.some((p) => SKUS.includes(p.productId));
      if (owned) {
        await saveProLocal(true);
        if (mounted.current) setIsPro(true);
      }
      return owned;
    } catch {
      return await loadProLocal();
    }
  }, []);

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

/** Free tier: 25 entries, no export, no cloud sync. Pro: unlimited + export + sync. */
export function canAddEntry(isPro: boolean, entryCount: number): boolean {
  return isPro || entryCount < FREE_ENTRY_LIMIT;
}
