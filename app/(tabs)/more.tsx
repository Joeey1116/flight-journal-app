/**
 * More — aircraft, qualifications, export, Pro, settings, and the
 * companion-sim import. Plus demo-data cleanup.
 */
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { Card, PrimaryButton, SecondaryButton, SectionTitle } from "../../components/ui";
import { COLORS } from "../../lib/theme";
import { useLogbook } from "../../lib/store";
import { validateSimPayload, simPayloadToEntry } from "../../lib/sim-import";

export default function MoreScreen() {
  const router = useRouter();
  const { addEntry, clearDemoData, syncToCloud } = useLogbook();
  const [simJson, setSimJson] = useState("");
  const [simMsg, setSimMsg] = useState("");
  const [syncMsg, setSyncMsg] = useState("");

  const importSim = async () => {
    setSimMsg("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(simJson);
    } catch {
      setSimMsg("That isn't valid JSON — paste the flight JSON from the simulator.");
      return;
    }
    const result = validateSimPayload(parsed);
    if (!result.ok) {
      setSimMsg(`Couldn't import: ${result.errors.join("; ")}`);
      return;
    }
    await addEntry(simPayloadToEntry(result.payload));
    setSimJson("");
    setSimMsg(`Imported ${result.payload.departure} → ${result.payload.arrival} (${result.payload.totalTime}h, sim).`);
  };

  const onClearDemo = () => {
    Alert.alert(
      "Clear all data?",
      "This deletes every flight, aircraft, and qualification on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete everything",
          style: "destructive",
          onPress: async () => {
            await clearDemoData();
            setSimMsg("All data cleared.");
          },
        },
      ],
    );
  };

  const onSync = async () => {
    setSyncMsg("Syncing…");
    const ok = await syncToCloud();
    setSyncMsg(
      ok
        ? "Synced to the cloud."
        : "Cloud sync needs a real Supabase project (Pro) — local data is safe.",
    );
  };

  return (
    <Screen>
      <Text style={styles.title}>MORE</Text>
      <Text style={styles.sub}>Aircraft, qualifications, export & settings</Text>

      <SectionTitle>Manage</SectionTitle>
      <SecondaryButton title="Aircraft" onPress={() => router.push("/aircraft")} />
      <SecondaryButton title="Qualifications & medical" onPress={() => router.push("/qualifications")} />
      <SecondaryButton title="Export (PDF / CSV)" onPress={() => router.push("/export")} />
      <SecondaryButton title="Go Pro" onPress={() => router.push("/pro")} />
      <SecondaryButton title="Settings" onPress={() => router.push("/settings")} />

      <SectionTitle>Import a sim flight</SectionTitle>
      <Card>
        <Text style={styles.body}>
          Flown in the companion flight simulator? Paste the flight JSON here
          (or open a flightjournal://import-sim link) — it imports as a
          simulator flight, kept separate from real-aircraft time.
        </Text>
        <TextInput
          style={styles.jsonInput}
          multiline
          numberOfLines={4}
          placeholder='{"schemaVersion":1,"source":"companion-sim",…}'
          placeholderTextColor={COLORS.faint}
          value={simJson}
          onChangeText={setSimJson}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <PrimaryButton title="Import sim flight" onPress={importSim} />
        {simMsg ? <Text style={styles.msg}>{simMsg}</Text> : null}
      </Card>

      <SectionTitle>Cloud sync</SectionTitle>
      <Card>
        <Text style={styles.body}>
          Your logbook lives on this device. Pro adds cloud sync so it follows
          you across devices.
        </Text>
        <PrimaryButton title="Sync now" onPress={onSync} />
        {syncMsg ? <Text style={styles.msg}>{syncMsg}</Text> : null}
      </Card>

      <SectionTitle>Data</SectionTitle>
      <SecondaryButton title="Clear all data (incl. demo flights)" onPress={onClearDemo} />
      <View style={{ height: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 14, marginTop: 2 },
  body: { color: COLORS.muted, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  jsonInput: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Menlo",
    padding: 10,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  msg: { color: COLORS.accent, fontSize: 13, marginTop: 10, lineHeight: 18 },
});
