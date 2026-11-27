/**
 * More — aircraft, qualifications, export, Pro, settings, and the
 * companion-sim import.
 */
import { useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { Card, NavRow, PrimaryButton, SecondaryButton, SectionTitle } from "../../components/ui";
import { COLORS } from "../../lib/theme";
import { useLogbook } from "../../lib/store";
import { usePro } from "../../lib/pro";
import { setOwner, useOwner } from "../../lib/owner";
import { validateSimPayload, simPayloadToEntry } from "../../lib/sim-import";

export default function MoreScreen() {
  const router = useRouter();
  const { addEntry } = useLogbook();
  const { isPro } = usePro();
  const owner = useOwner();
  // Hidden gesture on the version footer (see lib/owner.ts): seven
  // taps arm it, a long-press toggles. Nothing about the footer looks
  // tappable, and the only trace when active is the trailing "•".
  const versionTaps = useRef(0);
  const versionTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onVersionPress = () => {
    versionTaps.current += 1;
    if (versionTapTimer.current) clearTimeout(versionTapTimer.current);
    versionTapTimer.current = setTimeout(() => {
      versionTaps.current = 0;
    }, 3000);
  };
  const onVersionLongPress = () => {
    if (versionTaps.current >= 7) {
      versionTaps.current = 0;
      if (versionTapTimer.current) clearTimeout(versionTapTimer.current);
      void setOwner(!owner);
    }
  };
  const [simJson, setSimJson] = useState("");
  const [simMsg, setSimMsg] = useState("");

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

  return (
    <Screen>
      <Text style={styles.title}>MORE</Text>
      <Text style={styles.sub}>
        {Platform.OS === "web"
          ? "Aircraft, qualifications & settings"
          : "Aircraft, qualifications, export & settings"}
      </Text>

      <SectionTitle>Manage</SectionTitle>
      <NavRow title="Aircraft" onPress={() => router.push("/aircraft")} />
      <NavRow title="Qualifications & medical" onPress={() => router.push("/qualifications")} />
      {/* Web is free-tier only (Joey's rule): no Export (a Pro feature),
          no Go Pro row, no sim import — none of the Pro surface exists
          on web. */}
      {Platform.OS !== "web" && (
        <>
          <NavRow title="Export (PDF / CSV)" onPress={() => router.push("/export")} />
          <NavRow
            title={isPro ? "Pro is active ✓" : "Go Pro"}
            onPress={() => router.push("/pro")}
          />
        </>
      )}
      <NavRow title="Settings" onPress={() => router.push("/settings")} />

      {Platform.OS !== "web" && (
        <>
          <SectionTitle>Import a sim flight</SectionTitle>
      {isPro ? (
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
      ) : (
        <Card>
          <Text style={styles.body}>
            Sim-flight import is part of Pro. With Pro, flights from the
            companion simulator import straight into your logbook, kept
            separate from real-aircraft time.
          </Text>
          <SecondaryButton title="See Pro" onPress={() => router.push("/pro")} />
        </Card>
      )}
        </>
      )}

      <View style={{ height: 24 }} />
      <Pressable
        onPress={onVersionPress}
        onLongPress={onVersionLongPress}
        delayLongPress={600}
      >
        <Text style={styles.version}>
          Flight Journal v{Constants.expoConfig?.version ?? "1.0.0"}
          {owner ? " •" : ""}
        </Text>
      </Pressable>
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
  version: { color: COLORS.faint, fontSize: 12, textAlign: "center", marginBottom: 8 },
});
