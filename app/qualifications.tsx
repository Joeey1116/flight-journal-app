/**
 * Qualifications — medical certificates, flight reviews, ratings, and
 * endorsements. Expiry dates here drive the Currency tab warnings.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { Card, Field, PrimaryButton, SecondaryButton, SectionTitle } from "../components/ui";
import { COLORS } from "../lib/theme";
import { useLogbook } from "../lib/store";
import type { QualificationKind } from "../lib/types";

const KINDS: Array<{ kind: QualificationKind; label: string }> = [
  { kind: "medical", label: "Medical" },
  { kind: "flightReview", label: "Flight review" },
  { kind: "rating", label: "Rating" },
  { kind: "endorsement", label: "Endorsement" },
  { kind: "other", label: "Other" },
];

export default function QualificationsScreen() {
  const router = useRouter();
  const { qualifications, addQualification, deleteQualification } = useLogbook();
  const [kind, setKind] = useState<QualificationKind>("medical");
  const [name, setName] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  const add = async () => {
    setError("");
    if (!name.trim()) {
      setError("Give it a name (e.g. First Class Medical).");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(issuedDate)) {
      setError("Issued date must be YYYY-MM-DD.");
      return;
    }
    if (expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      setError("Expiry date must be YYYY-MM-DD (or leave it blank).");
      return;
    }
    await addQualification({
      kind,
      name: name.trim(),
      issuedDate,
      expiryDate: expiryDate || undefined,
    });
    setName("");
    setIssuedDate("");
    setExpiryDate("");
  };

  return (
    <Screen>
      <Text style={styles.title}>QUALIFICATIONS</Text>
      <Text style={styles.sub}>Medical, flight reviews, ratings & endorsements</Text>

      {qualifications.map((q) => (
        <Card key={q.id}>
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{q.name}</Text>
              <Text style={styles.detail}>
                {KINDS.find((k) => k.kind === q.kind)?.label ?? q.kind} · issued {q.issuedDate}
              </Text>
              <Text style={styles.detail}>
                {q.expiryDate ? `Expires ${q.expiryDate}` : "No expiry"}
              </Text>
            </View>
            <Pressable onPress={() => deleteQualification(q.id)}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        </Card>
      ))}
      {qualifications.length === 0 && (
        <Card><Text style={styles.muted}>Nothing on record yet.</Text></Card>
      )}

      <SectionTitle>Add qualification</SectionTitle>
      <Text style={styles.kindLabel}>Type</Text>
      <View style={styles.kindRow}>
        {KINDS.map((k) => (
          <Pressable
            key={k.kind}
            style={[styles.kindChip, kind === k.kind && styles.kindChipOn]}
            onPress={() => setKind(k.kind)}
          >
            <Text style={[styles.kindText, kind === k.kind && styles.kindTextOn]}>
              {k.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Field label="Name (e.g. First Class Medical)" value={name} onChangeText={setName} />
      <Field label="Issued date (YYYY-MM-DD)" value={issuedDate} onChangeText={setIssuedDate} placeholder="2026-03-15" />
      <Field label="Expiry date (YYYY-MM-DD, optional)" value={expiryDate} onChangeText={setExpiryDate} placeholder="2027-03-31" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton title="Add qualification" onPress={add} />
      <SecondaryButton title="Done" onPress={() => router.back()} />
      <View style={{ height: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 14, marginTop: 2 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { color: COLORS.text, fontSize: 16, fontWeight: "800" },
  detail: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  remove: { color: COLORS.bad, fontSize: 13, fontWeight: "700" },
  muted: { color: COLORS.muted, fontSize: 14 },
  kindLabel: {
    color: COLORS.muted, fontSize: 12, fontWeight: "700",
    letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6,
  },
  kindRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  kindChip: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  kindChipOn: { borderColor: COLORS.accent, backgroundColor: COLORS.accentDim },
  kindText: { color: COLORS.muted, fontSize: 13, fontWeight: "700" },
  kindTextOn: { color: COLORS.text },
  error: { color: COLORS.bad, fontSize: 14, marginVertical: 8 },
});
