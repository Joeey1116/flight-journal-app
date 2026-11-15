/**
 * Export — CSV and PDF, the pilot's data leaving the app in standard
 * formats. Pro feature: export is unlocked with Pro (free tier is
 * logging-only). The share sheet opens on iOS/Android; on web the
 * files download from the preview instead.
 */
import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { Card, PrimaryButton, SecondaryButton, SectionTitle } from "../components/ui";
import { COLORS } from "../lib/theme";
import { useLogbook } from "../lib/store";
import { usePro } from "../lib/pro";
import { buildCSV, buildLogbookHTML, shareLogbookPDF, shareTextFile } from "../lib/export";
import { sumEntries } from "../lib/totals";
import { loadSettings } from "../lib/settings";
import { useEffect } from "react";

export default function ExportScreen() {
  const router = useRouter();
  const { entries } = useLogbook();
  const { isPro } = usePro();
  const [status, setStatus] = useState("");
  const [pilotName, setPilotName] = useState("");

  useEffect(() => {
    void loadSettings().then((s) => setPilotName(s.displayName));
  }, []);

  const totals = sumEntries(entries);

  const needPro = () => {
    if (!isPro) {
      Alert.alert(
        "Pro feature",
        "Export (PDF + CSV) is part of Pro. Free logging covers 25 entries.",
        [
          { text: "Not now", style: "cancel" },
          { text: "See Pro", onPress: () => router.push("/pro") },
        ],
      );
      return true;
    }
    return false;
  };

  const exportCSV = async () => {
    if (needPro()) return;
    const csv = buildCSV(entries);
    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flight-journal.csv";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("CSV downloaded.");
      return;
    }
    const ok = await shareTextFile("flight-journal.csv", csv, "text/csv");
    setStatus(ok ? "CSV shared." : "Sharing isn't available on this device.");
  };

  const exportPDF = async () => {
    if (needPro()) return;
    const html = buildLogbookHTML(entries, totals, pilotName);
    if (Platform.OS === "web") {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flight-journal.html";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("Logbook page downloaded (HTML preview — PDF on device).");
      return;
    }
    const ok = await shareLogbookPDF(html);
    setStatus(ok ? "PDF shared." : "PDF export isn't available on this device.");
  };

  return (
    <Screen>
      <Text style={styles.title}>EXPORT</Text>
      <Text style={styles.sub}>
        {entries.length} flights · {totals.totalTime.toFixed(1)} hours total
      </Text>

      <Card>
        <Text style={styles.body}>
          Your logbook is yours. CSV imports into LogTen, ForeFlight,
          MyFlightbook, or a spreadsheet. PDF prints like the traditional
          paper logbook, with a totals row and a signature line.
        </Text>
        <Text style={styles.body}>
          {isPro
            ? "Pro is active — export is unlocked."
            : "Export is a Pro feature. Free logging covers 25 entries."}
        </Text>
      </Card>

      <SectionTitle>Export your logbook</SectionTitle>
      <PrimaryButton title="Export CSV" onPress={exportCSV} />
      <PrimaryButton title="Export PDF (logbook format)" onPress={exportPDF} />
      {status ? <Text style={styles.status}>{status}</Text> : null}
      {!isPro ? (
        <SecondaryButton title="See Pro plans" onPress={() => router.push("/pro")} />
      ) : null}
      <View style={{ height: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 14, marginTop: 2 },
  body: { color: COLORS.muted, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  status: { color: COLORS.accent, fontSize: 14, marginTop: 12 },
});
