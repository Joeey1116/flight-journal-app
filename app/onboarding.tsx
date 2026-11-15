import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../components/Screen";
import { GlassCard } from "../components/GlassCard";
import { Logo } from "../components/Logo";
import { maybeRequestTracking } from "../lib/tracking";

/**
 * Onboarding — three pages, then sign-up / sign-in.
 * No Skip / guest entry: the tabs require a real signed-in account,
 * so onboarding only leads to sign-up or sign-in.
 */
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

export default function Onboarding() {
  const [page, setPage] = useState(0);

  return (
    <Screen>
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
            for airline pilots, students, and sim pilots alike. Free to
            start, Pro when you want more.
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
          <Text style={styles.headline}>BEFORE YOU JOIN.</Text>
          <Text style={styles.subline}>Plain language, no surprises.</Text>
          <GlassCard style={styles.stepCard}>
            <Text style={styles.stepText}>
              • Your flights, aircraft, and qualifications are stored with
              your account and synced across your devices.
            </Text>
            <Text style={styles.stepText}>
              • Free tier: log up to 25 flights. Pro unlocks unlimited
              logging, PDF + CSV export, and cloud sync.
            </Text>
            <Text style={styles.stepText}>
              • Your data is yours — export it any time, delete your
              account any time in Settings.
            </Text>
            <Text style={styles.stepText}>
              • Flights flown in the companion flight simulator can auto-log
              into your logbook (optional, off by default).
            </Text>
          </GlassCard>
          <Text style={styles.fine}>
            By continuing you agree to the privacy policy. Flight Journal is
            a logbook, not an official FAA record — always keep your
            required records as your authority requires.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        {page < 2 ? (
          <TouchableOpacity
            style={styles.primary}
            onPress={() => setPage(page + 1)}
          >
            <Text style={styles.primaryText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primary}
              onPress={() => {
                void maybeRequestTracking();
                router.push("/sign-up");
              }}
            >
              <Text style={styles.primaryText}>Create account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondary}
              onPress={() => {
                void maybeRequestTracking();
                router.push("/sign-in");
              }}
            >
              <Text style={styles.secondaryText}>I already have an account</Text>
            </TouchableOpacity>
          </>
        )}
        <Text style={styles.fine}>Flight Journal — free to start.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: 24 },
  brand: {
    color: "#888888",
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
  subline: { color: "#8A94A8", fontSize: 15, textAlign: "center", marginTop: 10 },
  intro: { color: "#cccccc", fontSize: 16, lineHeight: 24, textAlign: "center" },
  steps: { gap: 12, marginTop: 20 },
  stepCard: { marginBottom: 4 },
  stepNum: { color: "#22D3EE", fontSize: 13, fontWeight: "800" },
  stepTitle: { color: "#ffffff", fontSize: 17, fontWeight: "800", marginTop: 4 },
  stepText: { color: "#cccccc", fontSize: 15, lineHeight: 22, marginTop: 6 },
  fine: { color: "#5A6478", fontSize: 12, lineHeight: 17, marginTop: 14, textAlign: "center" },
  footer: { marginTop: 28 },
  primary: {
    backgroundColor: "#22D3EE",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: "#04121A", fontSize: 16, fontWeight: "800" },
  secondary: {
    borderWidth: 1,
    borderColor: "#1E2A44",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
});
