/**
 * Logbook — the full flight list, newest first, with totals on top.
 * Tap a row to open the entry; the + button starts a new one.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { Card, PrimaryButton, Row, SectionTitle, Stat, fmtHours } from "../../components/ui";
import { COLORS } from "../../lib/theme";
import { useLogbook } from "../../lib/store";
import { sumEntries } from "../../lib/totals";

export default function LogbookScreen() {
  const router = useRouter();
  const { entries } = useLogbook();
  const totals = sumEntries(entries);
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Screen>
      <Text style={styles.title}>LOGBOOK</Text>
      <Text style={styles.sub}>{entries.length} flights</Text>

      <Card>
        <Row>
          <Stat label="Total" value={fmtHours(totals.totalTime)} sub="hours" />
          <Stat label="PIC" value={fmtHours(totals.pic)} sub="hours" />
          <Stat label="XC" value={fmtHours(totals.crossCountry)} sub="hours" />
        </Row>
        <Row>
          <Stat label="Night" value={fmtHours(totals.night)} sub="hours" />
          <Stat label="Landings" value={String(totals.dayLandings + totals.nightLandings)} sub="day + night" />
          <Stat label="Approaches" value={String(totals.approaches)} sub="instrument" />
        </Row>
      </Card>

      <SectionTitle>Flights</SectionTitle>
      {sorted.length === 0 && (
        <Card><Text style={styles.muted}>No flights logged yet.</Text></Card>
      )}
      {sorted.map((e) => (
        <Pressable
          key={e.id}
          onPress={() => router.push({ pathname: "/entry/[id]", params: { id: e.id } })}
        >
          <Card>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.route}>{e.departure} → {e.arrival}</Text>
                <Text style={styles.muted}>
                  {e.date} · {e.aircraftType} {e.registration}
                  {e.isSim ? " · SIM" : ""}
                </Text>
                {e.remarks ? <Text style={styles.remarks} numberOfLines={1}>{e.remarks}</Text> : null}
              </View>
              <Text style={styles.hours}>{fmtHours(e.totalTime)}h</Text>
            </View>
          </Card>
        </Pressable>
      ))}

      <PrimaryButton title="+ Log a flight" onPress={() => router.push("/entry/new")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 14, marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  route: { color: COLORS.text, fontSize: 16, fontWeight: "800", fontFamily: "Menlo" },
  hours: { color: COLORS.accent, fontSize: 17, fontWeight: "800" },
  muted: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  remarks: { color: COLORS.muted, fontSize: 13, marginTop: 4, fontStyle: "italic" },
});
