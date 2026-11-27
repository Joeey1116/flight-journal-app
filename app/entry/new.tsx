/**
 * New / edit entry — the full flight form.
 * Every field a real pilot logs: date, aircraft, route, block times,
 * time breakouts, landings, approaches, holds, sim flag, remarks.
 * Edit mode: opened with ?id=<entry id>; saves update the entry.
 * Free tier: FREE_ENTRY_LIMIT entries; the next new entry past the cap
 * is blocked (plain message on web, Pro prompt on native).
 */
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { BackButton } from "../../components/BackButton";
import { confirmAction } from "../../lib/dialog";
import { Field, NumberField, PrimaryButton, Row, SectionTitle } from "../../components/ui";
import { COLORS } from "../../lib/theme";
import { useLogbook } from "../../lib/store";
import { canAddEntry, usePro } from "../../lib/pro";
import { useOwner } from "../../lib/owner";
import { formatDate } from "../../lib/totals";
import { FREE_ENTRY_LIMIT, type LogbookEntry } from "../../lib/types";

const num = (s: string) => {
  const v = parseFloat(s);
  return Number.isFinite(v) && v >= 0 ? v : 0;
};
const int = (s: string) => {
  const v = parseInt(s, 10);
  return Number.isFinite(v) && v >= 0 ? v : 0;
};

type Form = Record<string, string>;

const EMPTY: Form = {
  date: formatDate(new Date()),
  aircraftType: "", aircraftModel: "", registration: "",
  departure: "", arrival: "", route: "",
  outTime: "", offTime: "", onTime: "", inTime: "",
  totalTime: "", pic: "", sic: "", dualReceived: "", dualGiven: "",
  solo: "", crossCountry: "", night: "", instrumentActual: "",
  instrumentSimulated: "", dayLandings: "", nightLandings: "",
  approaches: "", holds: "", remarks: "",
};

function entryToForm(e: LogbookEntry): Form {
  const f: Form = { ...EMPTY };
  f.date = e.date;
  f.aircraftType = e.aircraftType;
  f.aircraftModel = e.aircraftModel;
  f.registration = e.registration;
  f.departure = e.departure;
  f.arrival = e.arrival;
  f.route = e.route ?? "";
  f.outTime = e.outTime ?? "";
  f.offTime = e.offTime ?? "";
  f.onTime = e.onTime ?? "";
  f.inTime = e.inTime ?? "";
  f.totalTime = String(e.totalTime || "");
  f.pic = String(e.pic || "");
  f.sic = String(e.sic || "");
  f.dualReceived = String(e.dualReceived || "");
  f.dualGiven = String(e.dualGiven || "");
  f.solo = String(e.solo || "");
  f.crossCountry = String(e.crossCountry || "");
  f.night = String(e.night || "");
  f.instrumentActual = String(e.instrumentActual || "");
  f.instrumentSimulated = String(e.instrumentSimulated || "");
  f.dayLandings = String(e.dayLandings || "");
  f.nightLandings = String(e.nightLandings || "");
  f.approaches = String(e.approaches || "");
  f.holds = String(e.holds || "");
  f.remarks = e.remarks ?? "";
  return f;
}

export default function NewEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { entries, addEntry, updateEntry, aircraft } = useLogbook();
  const { isPro } = usePro();
  const owner = useOwner();
  const editing = useMemo(
    () => entries.find((e) => e.id === params.id),
    [entries, params.id],
  );
  const [form, setForm] = useState<Form>(() =>
    editing ? entryToForm(editing) : EMPTY,
  );
  const [isSim, setIsSim] = useState(editing?.isSim ?? false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      setForm(entryToForm(editing));
      setIsSim(editing.isSim);
    }
  }, [editing]);

  const set = (key: string) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const pickAircraft = (type: string) => {
    const match = aircraft.find((a) => a.type === type);
    setForm((prev) => ({
      ...prev,
      aircraftType: type,
      aircraftModel: match?.model ?? prev.aircraftModel,
      registration: match?.registration ?? prev.registration,
    }));
  };

  const save = async () => {
    setError("");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      setError("Date must be YYYY-MM-DD.");
      return;
    }
    if (!form.aircraftType.trim() || !form.registration.trim()) {
      setError("Aircraft type and registration are required.");
      return;
    }
    if (!/^[A-Z]{4}$/.test(form.departure.trim().toUpperCase())) {
      setError("Departure must be a 4-letter ICAO code (e.g. KJFK).");
      return;
    }
    if (!/^[A-Z]{4}$/.test(form.arrival.trim().toUpperCase())) {
      setError("Arrival must be a 4-letter ICAO code (e.g. KMIA).");
      return;
    }
    // The cap applies to the free tier. Pro removes it; the
    // device-local owner unlock (lib/owner.ts) bypasses ONLY this cap.
    if (!editing && !owner && !canAddEntry(isPro, entries.length)) {
      if (Platform.OS === "web") {
        // Web is free-tier only: state the limit plainly — no Pro
        // upsell, no purchase CTA.
        setError(`You've reached the free limit of ${FREE_ENTRY_LIMIT} entries.`);
        return;
      }
      const seePro = await confirmAction({
        title: "Free limit reached",
        message:
          `Free logging covers ${FREE_ENTRY_LIMIT} entries. Go Pro for unlimited entries and PDF/CSV export.`,
        confirmText: "See Pro",
        cancelText: "Not now",
      });
      if (seePro) router.push("/pro");
      return;
    }
    const data = {
      date: form.date,
      aircraftType: form.aircraftType.trim().toUpperCase(),
      aircraftModel: form.aircraftModel.trim(),
      registration: form.registration.trim().toUpperCase(),
      departure: form.departure.trim().toUpperCase(),
      arrival: form.arrival.trim().toUpperCase(),
      route: form.route.trim() || undefined,
      outTime: form.outTime.trim() || undefined,
      offTime: form.offTime.trim() || undefined,
      onTime: form.onTime.trim() || undefined,
      inTime: form.inTime.trim() || undefined,
      totalTime: num(form.totalTime),
      pic: num(form.pic),
      sic: num(form.sic),
      dualReceived: num(form.dualReceived),
      dualGiven: num(form.dualGiven),
      solo: num(form.solo),
      crossCountry: num(form.crossCountry),
      night: num(form.night),
      instrumentActual: num(form.instrumentActual),
      instrumentSimulated: num(form.instrumentSimulated),
      dayLandings: int(form.dayLandings),
      nightLandings: int(form.nightLandings),
      approaches: int(form.approaches),
      holds: int(form.holds),
      isSim,
      remarks: form.remarks.trim() || undefined,
    };
    if (editing) {
      await updateEntry(editing.id, data);
    } else {
      await addEntry(data);
    }
    router.back();
  };

  return (
    <Screen>
      <BackButton fallback="/(tabs)/logbook" />
      <Text style={styles.title}>{editing ? "EDIT FLIGHT" : "LOG A FLIGHT"}</Text>

      <SectionTitle>Flight</SectionTitle>
      <Field label="Date (YYYY-MM-DD)" value={form.date} onChangeText={set("date")} />
      <Row>
        <Field label="Aircraft type (e.g. C172)" value={form.aircraftType} onChangeText={(v) => pickAircraft(v.toUpperCase())} autoCapitalize="characters" />
        <Field label="Registration" value={form.registration} onChangeText={set("registration")} autoCapitalize="characters" />
      </Row>
      <Field label="Aircraft model" value={form.aircraftModel} onChangeText={set("aircraftModel")} />
      <Row>
        <Field label="From (ICAO)" value={form.departure} onChangeText={set("departure")} autoCapitalize="characters" maxLength={4} />
        <Field label="To (ICAO)" value={form.arrival} onChangeText={set("arrival")} autoCapitalize="characters" maxLength={4} />
      </Row>
      <Field label="Route" value={form.route} onChangeText={set("route")} autoCapitalize="characters" placeholder="KJFK KBOS" />

      <SectionTitle>Block times (HH:MM, optional)</SectionTitle>
      <Row>
        <Field label="Out" value={form.outTime} onChangeText={set("outTime")} placeholder="08:15" />
        <Field label="Off" value={form.offTime} onChangeText={set("offTime")} placeholder="08:22" />
      </Row>
      <Row>
        <Field label="On" value={form.onTime} onChangeText={set("onTime")} placeholder="09:40" />
        <Field label="In" value={form.inTime} onChangeText={set("inTime")} placeholder="09:48" />
      </Row>

      <SectionTitle>Time (decimal hours)</SectionTitle>
      <Row>
        <NumberField label="Total" value={form.totalTime} onChange={set("totalTime")} />
        <NumberField label="PIC" value={form.pic} onChange={set("pic")} />
      </Row>
      <Row>
        <NumberField label="SIC" value={form.sic} onChange={set("sic")} />
        <NumberField label="Solo" value={form.solo} onChange={set("solo")} />
      </Row>
      <Row>
        <NumberField label="Dual received" value={form.dualReceived} onChange={set("dualReceived")} />
        <NumberField label="Dual given" value={form.dualGiven} onChange={set("dualGiven")} />
      </Row>
      <Row>
        <NumberField label="Cross-country" value={form.crossCountry} onChange={set("crossCountry")} />
        <NumberField label="Night" value={form.night} onChange={set("night")} />
      </Row>
      <Row>
        <NumberField label="Instr. actual" value={form.instrumentActual} onChange={set("instrumentActual")} />
        <NumberField label="Instr. simulated" value={form.instrumentSimulated} onChange={set("instrumentSimulated")} />
      </Row>

      <SectionTitle>Landings & approaches</SectionTitle>
      <Row>
        <NumberField label="Day landings" value={form.dayLandings} onChange={set("dayLandings")} placeholder="0" />
        <NumberField label="Night landings" value={form.nightLandings} onChange={set("nightLandings")} placeholder="0" />
      </Row>
      <Row>
        <NumberField label="Approaches" value={form.approaches} onChange={set("approaches")} placeholder="0" />
        <NumberField label="Holds" value={form.holds} onChange={set("holds")} placeholder="0" />
      </Row>

      <Pressable style={styles.toggle} onPress={() => setIsSim((v) => !v)}>
        <Text style={styles.toggleBox}>{isSim ? "☑" : "☐"}</Text>
        <Text style={styles.toggleLabel}>
          Simulator flight — logged as sim time, separate from real-aircraft totals
        </Text>
      </Pressable>

      <SectionTitle>Remarks</SectionTitle>
      <Field label="Remarks" value={form.remarks} onChangeText={set("remarks")} multiline numberOfLines={3} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton title={editing ? "Save changes" : "Save flight"} onPress={save} />
      <View style={{ height: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  toggle: { flexDirection: "row", alignItems: "flex-start", marginVertical: 10 },
  toggleBox: { color: COLORS.accent, fontSize: 20, marginRight: 10 },
  toggleLabel: { color: COLORS.text, fontSize: 14, flex: 1, lineHeight: 20 },
  error: { color: COLORS.bad, fontSize: 14, marginVertical: 8 },
});
