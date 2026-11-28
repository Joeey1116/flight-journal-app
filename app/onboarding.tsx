import { useEffect, useState, type ReactNode } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "../components/Screen";
import { GlassCard } from "../components/GlassCard";
import { Logo } from "../components/Logo";
import { alertAction, showAlert } from "../lib/dialog";
import { loadSettings, saveSettings } from "../lib/settings";
import { FREE_ENTRY_LIMIT } from "../lib/types";
import {
  LIFETIME_SKU,
  PRO_NOTHING_TO_RESTORE_MESSAGE,
  PRO_NOTHING_TO_RESTORE_TITLE,
  PRO_NOT_ON_SALE_MESSAGE,
  PRO_NOT_ON_SALE_TITLE,
  SKUS,
  usePro,
} from "../lib/pro";

/**
 * Onboarding — welcome → how it works → plain-language promises →
 * Pro paywall → straight into the logbook. No account, no sign-in:
 * finishing (buying Pro OR tapping "Continue free") sets the
 * onboarding-complete flag and the launch gate never shows this again.
 *
 * BACKGROUND: the paywall and value screens sit over a full-screen
 * aviation photo (cockpit at golden hour, assets/onboarding-bg.jpg)
 * with a dark gradient overlay so text stays readable. The layered
 * gradients underneath remain as the fallback treatment if the
 * image ever fails to load.
 */
function OnboardingBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bgWrap}>
      <LinearGradient
        colors={["#1B2A52", "#0A1122", "#05070D", "#000000"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={require("../assets/onboarding-bg.jpg")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[
          "rgba(5,7,13,0.18)",
          "rgba(5,7,13,0.45)",
          "rgba(5,7,13,0.88)",
          "#05070D",
        ]}
        locations={[0, 0.4, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const STEPS = [
  {
    num: "01",
    title: "LOG",
    text: "Every flight in seconds — date, aircraft, route, times, landings, approaches. Full FAA 61.51 detail, or just the basics.",
  },
  {
    num: "02",
    title: "STAY CURRENT",
    text: "Day and night landing currency, instrument currency, flight review and medical dates — tracked automatically, with warnings before anything lapses.",
  },
  {
    num: "03",
    title: "EXPORT",
    text: "Your logbook is yours. One tap exports a print-ready PDF in traditional logbook format, or a CSV for any other app. No lock-in, ever.",
  },
];

const PRO_FEATURES = [
  "Unlimited logbook entries",
  "PDF & CSV export — traditional logbook format",
  "Currency tracking: landings, instrument, medical & flight review",
  "ATP minimums tracker",
  "Sim-flight auto-import from the companion simulator",
];

interface Plan {
  sku: string;
  name: string;
  priceLine: string;
  thenLine: string;
  badge?: string;
  trial: boolean;
}

// SKUS order is [monthly, yearly, lifetime] on both platforms.
// Display order: Yearly (best value) → Monthly → Lifetime.
function buildPlans(displayPrice: (sku: string) => string | undefined): Plan[] {
  const [monthly, yearly] = SKUS;
  const lifetime = LIFETIME_SKU;
  return [
    {
      sku: yearly,
      name: "Yearly",
      priceLine: `${displayPrice(yearly) ?? "$49.99"} / year`,
      thenLine: `Free for 7 days, then ${displayPrice(yearly) ?? "$49.99"}/year — cancel anytime`,
      badge: "BEST VALUE",
      trial: true,
    },
    {
      sku: monthly,
      name: "Monthly",
      priceLine: `${displayPrice(monthly) ?? "$4.99"} / month`,
      thenLine: `Free for 7 days, then ${displayPrice(monthly) ?? "$4.99"}/month — cancel anytime`,
      trial: true,
    },
    {
      sku: lifetime,
      name: "Lifetime",
      priceLine: `${displayPrice(lifetime) ?? "$99.99"} one-time`,
      thenLine: "One-time payment. No subscription, no trial.",
      trial: false,
    },
  ];
}

export default function Onboarding() {
  const [page, setPage] = useState(0);
  const [selectedSku, setSelectedSku] = useState<string>(SKUS[1]);
  const { products, busySku, error, refreshProducts, buy, restore } = usePro();

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const finish = async () => {
    try {
      const s = await loadSettings();
      await saveSettings({ ...s, onboardingComplete: true });
    } catch {
      // Best-effort — worst case onboarding shows again next launch.
    }
    router.replace("/(tabs)");
  };

  const plans = buildPlans((sku) => products.find((x) => x.id === sku)?.displayPrice);
  const selected = plans.find((p) => p.sku === selectedSku) ?? plans[0];

  const onCta = async () => {
    const result = await buy(selected.sku);
    if (result === "purchased") {
      await finish();
    } else if (result === "unavailable") {
      // Demo mode: no store products yet — never grant Pro for free.
      showAlert(PRO_NOT_ON_SALE_TITLE, PRO_NOT_ON_SALE_MESSAGE);
    } else {
      showAlert(
        "Purchase didn't go through",
        "Nothing was charged. Try again, or continue free for now.",
      );
    }
  };

  const onRestore = async () => {
    const result = await restore();
    if (result === "restored") {
      await alertAction("Purchase restored", "Pro is active again.", "Continue");
      await finish();
    } else if (result === "unavailable") {
      showAlert(PRO_NOTHING_TO_RESTORE_TITLE, PRO_NOTHING_TO_RESTORE_MESSAGE);
    } else {
      showAlert("Nothing to restore", "No previous Pro purchase was found.");
    }
  };

  const showTerms = () => {
    showAlert(
      "Terms",
      "Monthly and Yearly start with a 7-day free trial. Unless you cancel before the trial ends, your store account is charged the plan price, and the subscription renews automatically until cancelled. Cancel anytime in your App Store / Google Play subscription settings. Lifetime is a one-time payment with no subscription. Purchases are handled by Apple / Google under their standard terms.",
    );
  };

  return (
    <OnboardingBackground>
      <Screen transparentBackground>
        {page > 0 && (
          <TouchableOpacity
            style={styles.pageBack}
            onPress={() => setPage(page - 1)}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={10}
          >
            <Text style={styles.pageBackText}>‹ Back</Text>
          </TouchableOpacity>
        )}
        {page === 0 && (
          <View style={styles.page}>
            <View style={styles.hero}>
              <Logo size={120} />
              <Text style={styles.brand}>FLIGHT JOURNAL</Text>
              <Text style={styles.headline}>EVERY HOUR.{"\n"}EVERY LANDING.</Text>
              <Text style={styles.subline}>The logbook that keeps you current.</Text>
            </View>
            <Text style={styles.intro}>
              Log flights, track currency, and export a print-ready logbook —
              for airline pilots, students, and sim pilots alike. No account,
              no sign-in — it's already yours.{" "}
              {Platform.OS === "web"
                ? "Free to start."
                : "Free to start, Pro when you want more."}
            </Text>
          </View>
        )}

        {page === 1 && (
          <View style={styles.page}>
            <Text style={styles.headline}>HOW IT WORKS.</Text>
            <Text style={styles.subline}>Three things. Zero fine print.</Text>
            <View style={styles.steps}>
              {STEPS.map((s) => (
                <GlassCard key={s.num} style={styles.stepCard}>
                  <Text style={styles.stepNum}>{s.num}</Text>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepText}>{s.text}</Text>
                </GlassCard>
              ))}
            </View>
          </View>
        )}

        {page === 2 && (
          <View style={styles.page}>
            <Text style={styles.headline}>NO ACCOUNT.{"\n"}NO FINE PRINT.</Text>
            <Text style={styles.subline}>Plain language, no surprises.</Text>
            <GlassCard style={styles.stepCard}>
              <Text style={styles.stepText}>
                • No account and no sign-in. Your flights, aircraft, and
                qualifications are stored only on this device.
              </Text>
              <Text style={styles.stepText}>
                {Platform.OS === "web"
                  ? `• Free: log up to ${FREE_ENTRY_LIMIT} flights.`
                  : `• Free tier: log up to ${FREE_ENTRY_LIMIT} flights. Pro unlocks unlimited logging and PDF + CSV export.`}
              </Text>
              <Text style={styles.stepText}>
                {Platform.OS === "web"
                  ? "• Your data is yours — delete entries any time, or uninstall the app to erase everything on this device."
                  : "• Your data is yours — export it any time; delete entries any time, or uninstall the app to erase everything on this device."}
              </Text>
              {Platform.OS !== "web" && (
                <Text style={styles.stepText}>
                  • Flights flown in the companion flight simulator can
                  auto-log into your logbook (optional, off by default).
                </Text>
              )}
            </GlassCard>
            <Text style={styles.fine}>
              By continuing you agree to the privacy policy. Flight Journal
              is a logbook, not an official FAA record — always keep your
              required records as your authority requires.
            </Text>
          </View>
        )}

        {page === 3 && (
          <View style={styles.page}>
            <TouchableOpacity
              style={styles.close}
              onPress={() => void finish()}
              accessibilityLabel="Continue free"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.paywallHeadline}>Your logbook, handled.</Text>
            <Text style={styles.subline}>
              Go Pro and never count entries — or watch a deadline sneak up
              on you — again.
            </Text>

            <View style={styles.features}>
              {PRO_FEATURES.map((f) => (
                <Text key={f} style={styles.featureRow}>
                  <Text style={styles.check}>✓ </Text>
                  {f}
                </Text>
              ))}
            </View>

            <View style={styles.plans}>
              {plans.map((p) => {
                const active = p.sku === selected.sku;
                return (
                  <TouchableOpacity
                    key={p.sku}
                    style={[styles.planCard, active && styles.planCardActive]}
                    onPress={() => setSelectedSku(p.sku)}
                  >
                    <View style={styles.planLeft}>
                      <Text style={styles.planName}>
                        {p.name}
                        {p.badge ? <Text style={styles.badge}>  {p.badge}</Text> : null}
                      </Text>
                      <Text style={styles.planTrial}>
                        {p.trial ? "Includes 7-day free trial" : "Pay once — yours forever"}
                      </Text>
                    </View>
                    <Text style={styles.planPrice}>{p.priceLine}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.primary, busySku !== null && styles.primaryBusy]}
              onPress={() => void onCta()}
              disabled={busySku !== null}
            >
              <Text style={styles.primaryText}>
                {busySku !== null
                  ? "…"
                  : selected.trial
                    ? "Start my 7-day free trial"
                    : "Get Lifetime"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.fine}>{selected.thenLine}</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.linksRow}>
              <TouchableOpacity onPress={() => void onRestore()}>
                <Text style={styles.linkText}>Restore Purchase</Text>
              </TouchableOpacity>
              <Text style={styles.linkDot}>·</Text>
              <TouchableOpacity onPress={showTerms}>
                <Text style={styles.linkText}>Terms</Text>
              </TouchableOpacity>
              <Text style={styles.linkDot}>·</Text>
              <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
                <Text style={styles.linkText}>Privacy</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => void finish()}>
              <Text style={styles.continueFree}>Continue free — {FREE_ENTRY_LIMIT} entries included</Text>
            </TouchableOpacity>
          </View>
        )}

        {page < 3 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primary}
              onPress={() => {
                // Web has NO paywall (Joey's rule: web is free-tier
                // only) — the last info page finishes onboarding.
                if (Platform.OS === "web" && page === 2) {
                  void finish();
                } else {
                  setPage(page + 1);
                }
              }}
            >
              <Text style={styles.primaryText}>Continue</Text>
            </TouchableOpacity>
            <Text style={styles.fine}>Flight Journal — free to start.</Text>
          </View>
        )}
      </Screen>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  bgWrap: { flex: 1, backgroundColor: "#000000" },
  pageBack: { alignSelf: "flex-start", paddingVertical: 6, marginBottom: 6 },
  pageBackText: { color: "#22D3EE", fontSize: 16, fontWeight: "700" },
  page: { flex: 1, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: 24 },
  brand: {
    color: "#AAB4CC",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 4,
    marginTop: 20,
  },
  headline: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 36,
  },
  subline: { color: "#B8C2D9", fontSize: 15, textAlign: "center", marginTop: 10 },
  intro: { color: "#E4E9F5", fontSize: 16, lineHeight: 24, textAlign: "center" },
  steps: { gap: 12, marginTop: 20 },
  stepCard: { marginBottom: 4 },
  stepNum: { color: "#22D3EE", fontSize: 13, fontWeight: "800" },
  stepTitle: { color: "#ffffff", fontSize: 17, fontWeight: "800", marginTop: 4 },
  stepText: { color: "#E4E9F5", fontSize: 15, lineHeight: 22, marginTop: 6 },
  fine: { color: "#8A94A8", fontSize: 12, lineHeight: 17, marginTop: 14, textAlign: "center" },
  footer: { marginTop: 28 },
  primary: {
    backgroundColor: "#22D3EE",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBusy: { opacity: 0.6 },
  primaryText: { color: "#04121A", fontSize: 16, fontWeight: "800" },
  // Paywall
  close: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  closeText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  paywallHeadline: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 38,
  },
  features: { marginTop: 22, gap: 8 },
  featureRow: { color: "#E4E9F5", fontSize: 15, lineHeight: 21 },
  check: { color: "#4ADE80", fontWeight: "800" },
  plans: { gap: 10, marginTop: 22, marginBottom: 18 },
  planCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2A44",
    backgroundColor: "rgba(10,18,32,0.85)",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  planCardActive: { borderColor: "#F5C518", borderWidth: 2 },
  planLeft: { flex: 1, marginRight: 12 },
  planName: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  badge: { color: "#F5C518", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  planTrial: { color: "#B8C2D9", fontSize: 12, marginTop: 3 },
  planPrice: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  error: { color: "#F87171", fontSize: 13, textAlign: "center", marginTop: 8 },
  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  linkText: { color: "#8A94A8", fontSize: 12, fontWeight: "600" },
  linkDot: { color: "#5A6478", fontSize: 12 },
  continueFree: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
  },
});
