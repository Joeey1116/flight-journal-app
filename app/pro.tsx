/**
 * Pro — free vs Pro, and the purchase screen.
 * Free: 25 entries, on-device only. Pro: unlimited entries, PDF/CSV
 * export, ATP minimums tracker, sim-flight auto-import.
 *
 * Monthly and Yearly carry a 7-day free trial (presented here and on
 * the onboarding paywall); Lifetime is a one-time purchase, no trial.
 *
 * Product IDs are placeholders (TODO in lib/pro.ts) — Joey creates the
 * real products in App Store Connect / Play Console before launch.
 * In this scaffold the store is not connected, so purchases run in
 * demo mode (simulated locally) and the flow can be tested end to end.
 */
import { useEffect } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card, PrimaryButton, SecondaryButton, SectionTitle } from "../components/ui";
import { COLORS } from "../lib/theme";
import { SKU_NAMES, SKU_PRICES, SKUS, isSubscriptionSku, usePro } from "../lib/pro";
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
  const { entries } = useLogbook();
  const { isPro, products, busySku, error, refreshProducts, buy, restore } = usePro();

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const onBuy = async (sku: string) => {
    const ok = await buy(sku);
    Alert.alert(
      ok ? "Welcome to Pro" : "Purchase didn't go through",
      ok
        ? "Pro is active — unlimited entries and PDF/CSV export are unlocked."
        : "Nothing was charged. Try again, or restore a previous purchase.",
    );
  };

  const onRestore = async () => {
    const owned = await restore();
    Alert.alert(
      owned ? "Purchase restored" : "Nothing to restore",
      owned
        ? "Pro is active again."
        : "No previous Pro purchase was found.",
    );
  };

  return (
    <Screen>
      <Text style={styles.title}>GO PRO</Text>
      <Text style={styles.sub}>
        {entries.length} of {FREE_ENTRY_LIMIT} free entries used
      </Text>

      <Card>
        <SectionTitle>Free</SectionTitle>
        <CheckRow text="Log up to 25 flights" />
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
                <View style={styles.planRow}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{SKU_NAMES[sku] ?? sku}</Text>
                    <Text style={styles.planPrice}>{price}</Text>
                    <Text style={styles.trialText}>
                      {trial
                        ? `Free for 7 days, then ${price} — cancel anytime`
                        : "One-time purchase — yours forever"}
                    </Text>
                  </View>
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
                </View>
              </Card>
            );
          })}
          <Text style={styles.note}>
            Prices shown are the planned prices. Real store products are
            created in App Store Connect / Play Console before launch.
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
  planRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planInfo: { flex: 1, marginRight: 12 },
  planName: { color: COLORS.text, fontSize: 16, fontWeight: "800" },
  planPrice: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  trialText: { color: COLORS.pro, fontSize: 12, marginTop: 4, lineHeight: 16 },
  proActive: { color: COLORS.good, fontSize: 15, fontWeight: "800" },
  note: { color: COLORS.faint, fontSize: 12, lineHeight: 17, marginTop: 4 },
  error: { color: COLORS.bad, fontSize: 14, marginVertical: 8 },
});
