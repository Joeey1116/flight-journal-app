/**
 * Dashboard — totals at a glance, currency summary, recent flights.
 * The first screen a pilot sees: am I current, how many hours, what's next.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { Card, PrimaryButton, Row, SectionTitle, Stat, fmtHours } from "../../components/ui";
import { COLORS, STATUS_COLORS } from "../../lib/theme";
import { useLogbook } from "../../lib/store";
import { sumEntries, totalsInWindow, formatDate } from "../../lib/totals";
import { checkAllCurrency } from "../../lib/currency";

export default function DashboardScreen() {
  const router = useRouter();
  const { entries, qualifications, loaded } = useLogbook();
  const today = formatDate(new Date());
  const totals = sumEntries(entries);
  const last90 = totalsInWindow(entries, 90, today);
  const checks = checkAllCurrency(entries, qualifications, today);
  const worst = checks.find((c) => c.status === "expired") ?? checks.find((c) => c.status === "warning");
  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const simHours = sumEntries(entries, (e) => e.isSim).totalTime;

  return (
    <Screen>
      <Text style={styles.hello}>DASHBOARD</Text>
      <Text style={styles.sub}>{today} · {entries.length} flights logged</Text>

      <Card>
        <Row>
          <Stat label="Total time" value={fmtHours(totals.totalTime)} sub="hours" />
          <Stat label="PIC" value={fmtHours(totals.pic)} sub="hours" />
          <Stat label="Last 90 days" value={fmtHours(last90.totalTime)} sub="hours" />
        </Row>
        <Row>
          <Stat label="Night" value={fmtHours(totals.night)} sub="hours" />
          <Stat label="Instrument" value={fmtHours(totals.instrumentActual + totals.instrumentSimulated)} sub="hours" />
          <Stat label="Sim time" value={fmtHours(simHours)} sub="hours" />
        </Row>
      </Card>

      <SectionTitle>Currency</SectionTitle>
      <Pressable onPress={() => router.push("/(tabs)/currency")}>
        <Card style={worst ? { borderColor: STATUS_COLORS[worst.status] } : undefined}>
          {checks.map((c) => (
            <View key={c.id} style={styles.checkRow}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLORS[c.status] }]} />
              <Text style={styles.checkLabel}>{c.label}</Text>
              <Text style={[styles.checkStatus, { color: STATUS_COLORS[c.status] }]}>
                {c.status.toUpperCase()}
              </Text>
            </View>
          ))}
        </Card>
      </Pressable>

      <SectionTitle>Recent flights</SectionTitle>
      {recent.length === 0 && (
        <Card><Text style={styles.muted}>No flights yet — log your first one.</Text></Card>
      )}
      {recent.map((e) => (
        <Pressable
          key={e.id}
          onPress={() => router.push({ pathname: "/entry/[id]", params: { id: e.id } })}
        >
          <Card>
            <View style={styles.flightRow}>
              <View>
                <Text style={styles.flightRoute}>{e.departure} → {e.arrival}</Text>
                <Text style={styles.muted}>{e.date} · {e.aircraftType} {e.registration}</Text>
              </View>
              <Text style={styles.flightHours}>{fmtHours(e.totalTime)}h</Text>
            </View>
            {e.isSim ? <Text style={styles.simTag}>SIMULATOR</Text> : null}
          </Card>
        </Pressable>
      ))}

      <PrimaryButton title="+ Log a flight" onPress={() => router.push("/entry/new")} />
      {loaded ? null : <Text style={styles.muted}>Loading…</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 14, marginTop: 2 },
  checkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  checkLabel: { color: COLORS.text, fontSize: 15, flex: 1 },
  checkStatus: { fontSize: 12, fontWeight: "800" },
  flightRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  flightRoute: { color: COLORS.text, fontSize: 16, fontWeight: "800", fontFamily: "Menlo" },
  flightHours: { color: COLORS.accent, fontSize: 17, fontWeight: "800" },
  simTag: { color: COLORS.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginTop: 6 },
  muted: { color: COLORS.muted, fontSize: 14 },
});
