/**
 * Entry detail — every field of one flight, with edit and delete.
 */
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { BackButton } from "../../components/BackButton";
import { confirmAction } from "../../lib/dialog";
import { Card, PrimaryButton, SecondaryButton } from "../../components/ui";
import { COLORS } from "../../lib/theme";
import { useLogbook } from "../../lib/store";
import { fmtHours } from "../../components/ui";

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, deleteEntry } = useLogbook();
  const e = entries.find((x) => x.id === id);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/logbook");
  };

  if (!e) {
    return (
      <Screen>
        <BackButton fallback="/(tabs)/logbook" />
        <Text style={styles.title}>FLIGHT NOT FOUND</Text>
        <SecondaryButton title="Back to logbook" onPress={goBack} />
      </Screen>
    );
  }

  const onDelete = async () => {
    const ok = await confirmAction({
      title: "Delete this flight?",
      message: `${e.date} · ${e.departure} → ${e.arrival}`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    await deleteEntry(e.id);
    goBack();
  };

  return (
    <Screen>
      <BackButton fallback="/(tabs)/logbook" />
      <Text style={styles.title}>{e.departure} → {e.arrival}</Text>
      <Text style={styles.sub}>
        {e.date} · {e.aircraftType} {e.aircraftModel} · {e.registration}
        {e.isSim ? " · SIMULATOR" : ""}
      </Text>

      <Card>
        <RowItem label="Route" value={e.route ?? "—"} />
        <RowItem label="Out / Off" value={`${e.outTime ?? "—"} / ${e.offTime ?? "—"}`} />
        <RowItem label="On / In" value={`${e.onTime ?? "—"} / ${e.inTime ?? "—"}`} />
        <RowItem label="Total time" value={`${fmtHours(e.totalTime)} h`} />
        <RowItem label="PIC" value={`${fmtHours(e.pic)} h`} />
        <RowItem label="SIC" value={`${fmtHours(e.sic)} h`} />
        <RowItem label="Dual received" value={`${fmtHours(e.dualReceived)} h`} />
        <RowItem label="Dual given" value={`${fmtHours(e.dualGiven)} h`} />
        <RowItem label="Solo" value={`${fmtHours(e.solo)} h`} />
        <RowItem label="Cross-country" value={`${fmtHours(e.crossCountry)} h`} />
        <RowItem label="Night" value={`${fmtHours(e.night)} h`} />
        <RowItem label="Instrument actual" value={`${fmtHours(e.instrumentActual)} h`} />
        <RowItem label="Instrument simulated" value={`${fmtHours(e.instrumentSimulated)} h`} />
        <RowItem label="Day landings" value={String(e.dayLandings)} />
        <RowItem label="Night landings" value={String(e.nightLandings)} />
        <RowItem label="Approaches" value={String(e.approaches)} />
        <RowItem label="Holds" value={String(e.holds)} />
        <RowItem label="Remarks" value={e.remarks ?? "—"} />
      </Card>

      <PrimaryButton
        title="Edit flight"
        onPress={() => router.push({ pathname: "/entry/new", params: { id: e.id } })}
      />
      <SecondaryButton title="Delete flight" onPress={onDelete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1, fontFamily: "Menlo" },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 14, marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  label: { color: COLORS.muted, fontSize: 14 },
  value: { color: COLORS.text, fontSize: 14, fontWeight: "700", textAlign: "right", flex: 1, marginLeft: 12 },
});
