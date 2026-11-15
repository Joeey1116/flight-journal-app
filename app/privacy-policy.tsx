import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { Screen } from "../components/Screen";

/**
 * Privacy policy — plain language, logbook-specific.
 * WORKING TITLE NOTE: "Flight Journal" is a placeholder working title,
 * not the final app name.
 */
const SECTIONS: { title: string; body: string }[] = [
  {
    title: "What we store",
    body: "Your flights, aircraft, qualifications, and profile are stored with your account (and on your device) so your logbook follows you across devices and survives a phone change.",
  },
  {
    title: "What we do with it",
    body: "Only to run your logbook: totals, currency tracking, reminders, and exports you ask for. We do not sell your data, show ads, or share your logbook with anyone.",
  },
  {
    title: "Sim import",
    body: "If you turn it on, flights you fly in the companion flight simulator can be imported into your logbook automatically. It is off by default, and every imported flight is marked as a sim flight.",
  },
  {
    title: "Exports",
    body: "Your logbook is yours. Export a PDF or CSV any time from More → Export. Exports are generated on your device.",
  },
  {
    title: "Deleting your data",
    body: "Delete your account any time in Settings. Deleting your account removes your profile, flights, aircraft, and qualifications from our servers. Export first if you want to keep a copy.",
  },
  {
    title: "Not an official record",
    body: "Flight Journal is a logbook app, not an official FAA record. Always keep the records your authority requires, and verify any totals before relying on them for a checkride, application, or currency decision.",
  },
];

export default function PrivacyPolicy() {
  return (
    <Screen>
      <Text style={styles.headline}>Privacy Policy</Text>
      <Text style={styles.subline}>Flight Journal — plain language.</Text>
      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.body}>{s.body}</Text>
        </View>
      ))}
      <Text style={styles.fine}>
        Questions? Email contact@beatrackfam.info.
      </Text>
      <TouchableOpacity
        style={styles.link}
        onPress={() => void Linking.openURL("https://beatrackfam.info")}
      >
        <Text style={styles.linkText}>beatrackfam.info</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { color: "#ffffff", fontSize: 26, fontWeight: "800" },
  subline: { color: "#8A94A8", fontSize: 15, marginTop: 4, marginBottom: 16 },
  section: { marginBottom: 16 },
  title: { color: "#ffffff", fontSize: 16, fontWeight: "800", marginBottom: 4 },
  body: { color: "#cccccc", fontSize: 15, lineHeight: 22 },
  fine: { color: "#5A6478", fontSize: 12, lineHeight: 17, marginTop: 8 },
  link: { marginTop: 12 },
  linkText: { color: "#22D3EE", fontSize: 15, fontWeight: "700" },
  back: {
    borderWidth: 1,
    borderColor: "#1E2A44",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  backText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
});
