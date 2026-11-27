/**
 * Pro — free vs Pro, and the purchase screen.
 * Free: FREE_ENTRY_LIMIT entries, on-device only. Pro: unlimited entries, PDF/CSV
 * export, ATP minimums tracker, sim-flight auto-import.
 *
 * Monthly and Yearly carry a 7-day free trial (presented here and on
 * the onboarding paywall); Lifetime is a one-time purchase, no trial.
 *
 * Product IDs are placeholders (TODO in lib/pro.ts) — Joey creates the
 * real products in App Store Connect / Play Console before launch.
 * Until then there is no store connection: buying and restoring report
 * "unavailable" and this screen says so plainly — Pro is never granted
 * for free, and no control on this screen is a dead tap.
 */
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { BackButton } from "../components/BackButton";
import { showAlert } from "../lib/dialog";
import { Card, PrimaryButton, SecondaryButton, SectionTitle } from "../components/ui";
import { COLORS } from "../lib/theme";
import {
  PRO_NOTHING_TO_RESTORE_MESSAGE,
  PRO_NOTHING_TO_RESTORE_TITLE,
  PRO_NOT_ON_SALE_MESSAGE,
  PRO_NOT_ON_SALE_TITLE,
  SKU_NAMES,
  SKU_PRICES,
  SKUS,
  isSubscriptionSku,
  usePro,
} from "../lib/pro";
import { useLogbook } from "../lib/store";
import { FREE_ENTRY_LIMIT } from "../lib/types";

function CheckRow({ text }: { text: string }) {
  return (
    <Text style={styles.checkRow}>
      <Text style={styles.check}>✓ </Text>
      {text}
    </Text>
  );
}

export default function ProScreen() {
  const router = useRouter();
  const { entries } = useLogbook();
  const { isPro, connected, products, busySku, error, refreshProducts, buy, restore } =
    usePro();

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const onBuy = async (sku: string) => {
    const result = await buy(sku);
    if (result === "purchased") {
      showAlert(
        "Welcome to Pro",
        "Pro is active — unlimited entries and PDF/CSV export are unlocked.",
      );
    } else if (result === "unavailable") {
      showAlert(PRO_NOT_ON_SALE_TITLE, PRO_NOT_ON_SALE_MESSAGE);
    } else {
      showAlert(
        "Purchase didn't go through",
        "Nothing was charged. Try again, or restore a previous purchase.",
      );
    }
  };

  const onRestore = async () => {
    const result = await restore();
    if (result === "restored") {
      showAlert("Purchase restored", "Pro is active again.");
    } else if (result === "unavailable") {
      showAlert(PRO_NOTHING_TO_RESTORE_TITLE, PRO_NOTHING_TO_RESTORE_MESSAGE);
    } else {
      showAlert("Nothing to restore", "No previous Pro purchase was found.");
    }
  };

  // Web has no Pro surface at all (Joey's rule: web is free-tier
  // only). Nothing in the web UI links here; if someone lands on the
  // route directly, say so plainly instead of showing a paywall.
  if (Platform.OS === "web") {
    return (
      <Screen>
        <BackButton fallback="/(tabs)/more" />
        <Text style={styles.title}>GO PRO</Text>
        <Card>
          <Text style={styles.webNote}>
            Flight Journal Pro lives in the iOS and Android apps. This web
            version is the free logbook — log up to {FREE_ENTRY_LIMIT}{" "}
            flights, and that's the whole deal here.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton fallback="/(tabs)/more" />
      <Text style={styles.title}>GO PRO</Text>
      <Text style={styles.sub}>
        {isPro
          ? `${entries.length} of Unlimited entries used`
          : `${entries.length} of ${FREE_ENTRY_LIMIT} free entries used`}
      </Text>

      <Card>
        <SectionTitle>Free</SectionTitle>
        <CheckRow text={`Log up to ${FREE_ENTRY_LIMIT} flights`} />
        <CheckRow text="Totals, currency & stats" />
        <CheckRow text="On-device storage" />
      </Card>

      <Card style={{ borderColor: COLORS.pro }}>
        <SectionTitle>Pro — everything in Free, plus:</SectionTitle>
        <CheckRow text="Unlimited entries" />
        <CheckRow text="PDF + CSV export" />
        <CheckRow text="ATP minimums tracker" />
        <CheckRow text="Sim-flight auto-import" />
      </Card>

      {isPro ? (
        <Card>
          <Text style={styles.proActive}>✓ Pro is active on this device.</Text>
        </Card>
      ) : (
        <>
          <SectionTitle>Plans</SectionTitle>
          {SKUS.map((sku) => {
            const p = products.find((x) => x.id === sku);
            const trial = isSubscriptionSku(sku);
            const price = p?.displayPrice ?? SKU_PRICES[sku] ?? "";
            return (
              <Card key={sku}>
                <Text style={styles.planName}>{SKU_NAMES[sku] ?? sku}</Text>
                <Text style={styles.planPrice}>{price}</Text>
                <Text style={styles.trialText}>
                  {trial
                    ? `Free for 7 days, then ${price} — cancel anytime`
                    : "One-time purchase — yours forever"}
                </Text>
                <PrimaryButton
                  title={
                    busySku === sku
                      ? "…"
                      : trial
                        ? "Start 7-day free trial"
                        : "Get Pro"
                  }
                  onPress={() => onBuy(sku)}
                  disabled={busySku !== null}
                />
              </Card>
            );
          })}
          <Text style={styles.note}>
            {connected
              ? "Prices shown are the planned prices. Real store products are created in App Store Connect / Play Console before launch."
              : `${PRO_NOT_ON_SALE_TITLE} — ${PRO_NOT_ON_SALE_MESSAGE} The plans below are the launch plans; picking one now just shows you this message.`}
          </Text>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <SecondaryButton title="Restore purchase" onPress={onRestore} />
      <View style={{ height: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 14, marginTop: 2 },
  checkRow: { color: COLORS.text, fontSize: 15, paddingVertical: 3 },
  check: { color: COLORS.good, fontWeight: "800" },
  planName: { color: COLORS.text, fontSize: 16, fontWeight: "800" },
  planPrice: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  trialText: { color: COLORS.pro, fontSize: 12, marginTop: 4, lineHeight: 16, marginBottom: 4 },
  proActive: { color: COLORS.good, fontSize: 15, fontWeight: "800" },
  webNote: { color: COLORS.muted, fontSize: 14, lineHeight: 20 },
  note: { color: COLORS.faint, fontSize: 12, lineHeight: 17, marginTop: 4 },
  error: { color: COLORS.bad, fontSize: 14, marginVertical: 8 },
});
