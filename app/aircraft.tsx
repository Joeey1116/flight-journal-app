/**
 * Aircraft — the fleet. Type, model, registration, and the flags that
 * drive totals (multi-engine for ATP, turbine, complex, tailwheel).
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { BackButton } from "../components/BackButton";
import { confirmAction } from "../lib/dialog";
import { Card, Field, PrimaryButton, SecondaryButton, SectionTitle } from "../components/ui";
import { COLORS } from "../lib/theme";
import { useLogbook } from "../lib/store";

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable style={styles.toggle} onPress={() => onChange(!value)}>
      <Text style={styles.toggleBox}>{value ? "☑" : "☐"}</Text>
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

export default function AircraftScreen() {
  const router = useRouter();
  const { aircraft, addAircraft, deleteAircraft } = useLogbook();
  const [type, setType] = useState("");
  const [model, setModel] = useState("");
  const [registration, setRegistration] = useState("");
  const [multiEngine, setMultiEngine] = useState(false);
  const [turbine, setTurbine] = useState(false);
  const [complex, setComplex] = useState(false);
  const [tailwheel, setTailwheel] = useState(false);
  const [error, setError] = useState("");

  const add = async () => {
    setError("");
    if (!type.trim() || !registration.trim()) {
      setError("Type and registration are required.");
      return;
    }
    await addAircraft({
      type: type.trim().toUpperCase(),
      model: model.trim(),
      registration: registration.trim().toUpperCase(),
      category: multiEngine ? "AMEL" : "ASEL",
      engine: turbine ? "jet" : "piston",
      multiEngine,
      turbine,
      complex,
      tailwheel,
    });
    setType("");
    setModel("");
    setRegistration("");
    setMultiEngine(false);
    setTurbine(false);
    setComplex(false);
    setTailwheel(false);
  };

  const onRemove = async (a: (typeof aircraft)[number]) => {
    const ok = await confirmAction({
      title: "Remove this aircraft?",
      message: `${a.type} · ${a.registration}`,
      confirmText: "Remove",
      destructive: true,
    });
    if (ok) await deleteAircraft(a.id);
  };

  return (
    <Screen>
      <BackButton fallback="/(tabs)/more" />
      <Text style={styles.title}>AIRCRAFT</Text>
      <Text style={styles.sub}>{aircraft.length} in your fleet</Text>

      {aircraft.map((a) => (
        <Card key={a.id}>
          <View style={styles.head}>
            <View>
              <Text style={styles.name}>{a.type} · {a.registration}</Text>
              <Text style={styles.detail}>{a.model}</Text>
              <Text style={styles.detail}>
                {a.category} · {a.engine}
                {a.multiEngine ? " · multi-engine" : ""}
                {a.turbine ? " · turbine" : ""}
                {a.complex ? " · complex" : ""}
                {a.tailwheel ? " · tailwheel" : ""}
              </Text>
            </View>
            <Pressable onPress={() => void onRemove(a)}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        </Card>
      ))}
      {aircraft.length === 0 && (
        <Card><Text style={styles.muted}>No aircraft yet — add your first one below.</Text></Card>
      )}

      <SectionTitle>Add aircraft</SectionTitle>
      <Field label="Type (e.g. C172)" value={type} onChangeText={setType} autoCapitalize="characters" />
      <Field label="Model (e.g. Cessna 172S Skyhawk)" value={model} onChangeText={setModel} />
      <Field label="Registration (e.g. N12345)" value={registration} onChangeText={setRegistration} autoCapitalize="characters" />
      <Toggle label="Multi-engine" value={multiEngine} onChange={setMultiEngine} />
      <Toggle label="Turbine" value={turbine} onChange={setTurbine} />
      <Toggle label="Complex" value={complex} onChange={setComplex} />
      <Toggle label="Tailwheel" value={tailwheel} onChange={setTailwheel} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton title="Add aircraft" onPress={add} />
      <SecondaryButton title="Done" onPress={() => router.back()} />
      <View style={{ height: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 14, marginTop: 2 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { color: COLORS.text, fontSize: 16, fontWeight: "800", fontFamily: "Menlo" },
  detail: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  remove: { color: COLORS.bad, fontSize: 13, fontWeight: "700" },
  muted: { color: COLORS.muted, fontSize: 14 },
  toggle: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  toggleBox: { color: COLORS.accent, fontSize: 20, marginRight: 10 },
  toggleLabel: { color: COLORS.text, fontSize: 15 },
  error: { color: COLORS.bad, fontSize: 14, marginVertical: 8 },
});
