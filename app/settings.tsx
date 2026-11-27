import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../components/Screen";
import { GlassCard } from "../components/GlassCard";
import { loadSettings, saveSettings, type Settings } from "../lib/settings";
import { usePro } from "../lib/pro";

/**
 * Settings — pilot profile and preferences, all on-device.
 * There is no account (removed Nov 27, 2026): display name, home
 * airport, and default aircraft live in local Settings and pre-fill
 * new entries and exports.
 */
export default function SettingsScreen() {
  const { isPro } = usePro();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  if (!settings) {
    return (
      <Screen>
        <Text style={styles.loading}>Loading…</Text>
      </Screen>
    );
  }

  const update = async (next: Settings) => {
    setSettings(next);
    await saveSettings(next);
  };

  return (
    <Screen>
      <Text style={styles.headline}>Settings</Text>
      <Text style={styles.subline}>Your profile, your preferences — all on this device.</Text>

      <GlassCard style={styles.card}>
        <Text style={styles.label}>DISPLAY NAME</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#5A6478"
          placeholder="Your name"
          value={settings.displayName}
          onChangeText={(v) => void update({ ...settings, displayName: v })}
        />
        <Text style={styles.hint}>Shown on your exports and profile.</Text>

        <Text style={styles.label}>HOME AIRPORT (ICAO)</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#5A6478"
          placeholder="KJFK"
          autoCapitalize="characters"
          maxLength={4}
          value={settings.homeAirport}
          onChangeText={(v) =>
            void update({ ...settings, homeAirport: v.toUpperCase().replace(/[^A-Z]/g, "") })
          }
        />
        <Text style={styles.hint}>Pre-fills the departure field on new entries.</Text>

        <Text style={styles.label}>DEFAULT AIRCRAFT TYPE</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#5A6478"
          placeholder="C172"
          autoCapitalize="characters"
          value={settings.defaultAircraftType}
          onChangeText={(v) => void update({ ...settings, defaultAircraftType: v.toUpperCase() })}
        />
      </GlassCard>

      <GlassCard style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Currency reminders</Text>
            <Text style={styles.switchHint}>
              Warn me before a currency or deadline lapses.
            </Text>
          </View>
          <Switch
            value={settings.currencyReminders}
            onValueChange={(v) => void update({ ...settings, currencyReminders: v })}
            trackColor={{ false: "#1E2A44", true: "#0E7490" }}
            thumbColor="#22D3EE"
          />
        </View>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Notifications</Text>
            <Text style={styles.switchHint}>Reminders you asked for.</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(v) => void update({ ...settings, notificationsEnabled: v })}
            trackColor={{ false: "#1E2A44", true: "#0E7490" }}
            thumbColor="#22D3EE"
          />
        </View>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.label}>PLAN</Text>
        <Text style={styles.planText}>
          {isPro ? "Flight Journal Pro — thank you!" : "Free — up to 25 flights logged."}
        </Text>
        {!isPro && (
          <TouchableOpacity style={styles.primary} onPress={() => router.push("/pro")}>
            <Text style={styles.primaryText}>Go Pro</Text>
          </TouchableOpacity>
        )}
      </GlassCard>

      <TouchableOpacity
        style={styles.secondary}
        onPress={() => router.push("/privacy-policy")}
      >
        <Text style={styles.secondaryText}>Privacy policy</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { color: "#ffffff", fontSize: 26, fontWeight: "800" },
  subline: { color: "#8A94A8", fontSize: 15, marginTop: 4, marginBottom: 16 },
  loading: { color: "#8A94A8", fontSize: 15, marginTop: 40, textAlign: "center" },
  card: { marginBottom: 12 },
  label: {
    color: "#8A94A8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#0A1220",
    borderWidth: 1,
    borderColor: "#1E2A44",
    borderRadius: 10,
    color: "#ffffff",
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  hint: { color: "#5A6478", fontSize: 12, lineHeight: 16, marginTop: 6 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  switchText: { flex: 1, marginRight: 12 },
  switchTitle: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  switchHint: { color: "#8A94A8", fontSize: 13, marginTop: 2 },
  planText: { color: "#ffffff", fontSize: 15, fontWeight: "700", marginBottom: 10 },
  primary: {
    backgroundColor: "#22D3EE",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryText: { color: "#04121A", fontSize: 15, fontWeight: "800" },
  secondary: {
    borderWidth: 1,
    borderColor: "#1E2A44",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
});
