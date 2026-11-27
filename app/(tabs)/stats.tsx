/**
 * Stats — hours by type, hours by month, and the ATP minimums ladder.
 * The view a pilot opens before a checkride or an airline application.
 */
import { Platform, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { Card, Row, SecondaryButton, SectionTitle, Stat, fmtHours } from "../../components/ui";
import { COLORS } from "../../lib/theme";
import { useLogbook } from "../../lib/store";
import { usePro } from "../../lib/pro";
import { atpProgress, hoursPerMonth, sumEntries, totalsByType, formatDate } from "../../lib/totals";

export default function StatsScreen() {
  const router = useRouter();
  const { entries, aircraft } = useLogbook();
  const { isPro } = usePro();
  const totals = sumEntries(entries);
  const byType = totalsByType(entries);
  const monthly = hoursPerMonth(entries, 6, formatDate(new Date()));
  const multiTypes = new Set(
    aircraft.filter((a) => a.multiEngine).map((a) => a.type),
  );
  const multiTime = sumEntries(entries, (e) => multiTypes.has(e.aircraftType)).totalTime;
  const atp = atpProgress(totals, multiTime);
  const maxMonth = Math.max(1, ...monthly.map((m) => m.hours));

  return (
    <Screen>
      <Text style={styles.title}>STATS</Text>
      <Text style={styles.sub}>Totals across {entries.length} flights</Text>

      <Card>
        <Row>
          <Stat label="Total" value={fmtHours(totals.totalTime)} sub="hours" />
          <Stat label="PIC" value={fmtHours(totals.pic)} sub="hours" />
          <Stat label="SIC" value={fmtHours(totals.sic)} sub="hours" />
        </Row>
        <Row>
          <Stat label="Dual rec." value={fmtHours(totals.dualReceived)} sub="hours" />
          <Stat label="Solo" value={fmtHours(totals.solo)} sub="hours" />
          <Stat label="XC" value={fmtHours(totals.crossCountry)} sub="hours" />
        </Row>
        <Row>
          <Stat label="Night" value={fmtHours(totals.night)} sub="hours" />
          <Stat label="Instr actual" value={fmtHours(totals.instrumentActual)} sub="hours" />
          <Stat label="Instr sim" value={fmtHours(totals.instrumentSimulated)} sub="hours" />
        </Row>
      </Card>

      <SectionTitle>Hours by month</SectionTitle>
      <Card>
        {monthly.map((m) => (
          <View key={m.label} style={styles.barRow}>
            <Text style={styles.barLabel}>{m.label}</Text>
            <View style={styles.barTrack}>
              <View
                style={[styles.barFill, { width: `${Math.round((m.hours / maxMonth) * 100)}%` }]}
              />
            </View>
            <Text style={styles.barValue}>{m.hours.toFixed(1)}h</Text>
          </View>
        ))}
      </Card>

      <SectionTitle>Hours by aircraft type</SectionTitle>
      {Object.entries(byType).map(([type, t]) => (
        <Card key={type}>
          <View style={styles.typeRow}>
            <Text style={styles.typeName}>{type}</Text>
            <Text style={styles.typeHours}>{fmtHours(t.totalTime)}h</Text>
          </View>
          <Text style={styles.typeDetail}>
            PIC {fmtHours(t.pic)} · SIC {fmtHours(t.sic)} · Night {fmtHours(t.night)} ·{" "}
            {t.dayLandings + t.nightLandings} landings
          </Text>
        </Card>
      ))}
      {Object.keys(byType).length === 0 && (
        <Card><Text style={styles.muted}>No flights yet.</Text></Card>
      )}

      {/* The ATP tracker is a Pro feature; web has no Pro surface at
          all (free-tier only), so the section simply doesn't exist
          there. */}
      {Platform.OS !== "web" && (
        <>
          <SectionTitle>ATP minimums (FAA 61.159)</SectionTitle>
      {isPro ? (
        <Card>
          {atp.map((a) => (
            <View key={a.label} style={styles.atpRow}>
              <Text style={styles.atpLabel}>{a.label}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${a.pct}%`, backgroundColor: a.done ? COLORS.good : COLORS.accent },
                  ]}
                />
              </View>
              <Text style={styles.atpValue}>
                {a.have}/{a.need}
              </Text>
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          <Text style={styles.muted}>
            The ATP minimums tracker is part of Pro — see exactly how close
            you are to the FAA 61.159 minimums, line by line.
          </Text>
          <SecondaryButton title="See Pro" onPress={() => router.push("/pro")} />
        </Card>
      )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 14, marginTop: 2 },
  muted: { color: COLORS.muted, fontSize: 14 },
  barRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5 },
  barLabel: { color: COLORS.text, fontSize: 13, width: 34 },
  barTrack: {
    flex: 1, height: 10, backgroundColor: COLORS.input,
    borderRadius: 5, overflow: "hidden", marginHorizontal: 8,
  },
  barFill: { height: "100%", backgroundColor: COLORS.accent, borderRadius: 5 },
  barValue: { color: COLORS.muted, fontSize: 12, width: 44, textAlign: "right" },
  typeRow: { flexDirection: "row", justifyContent: "space-between" },
  typeName: { color: COLORS.text, fontSize: 16, fontWeight: "800", fontFamily: "Menlo" },
  typeHours: { color: COLORS.accent, fontSize: 16, fontWeight: "800" },
  typeDetail: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  atpRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  atpLabel: { color: COLORS.text, fontSize: 13, width: 96 },
  atpValue: { color: COLORS.text, fontSize: 12, width: 74, textAlign: "right" },
});
