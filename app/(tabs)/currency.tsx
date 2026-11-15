/**
 * Currency — every FAR 61.57 / 61.56 check in one place.
 * Green = current, amber = expiring soon, red = lapsed.
 */
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { Card, SecondaryButton } from "../../components/ui";
import { COLORS, STATUS_COLORS } from "../../lib/theme";
import { useLogbook } from "../../lib/store";
import { checkAllCurrency } from "../../lib/currency";
import { formatDate } from "../../lib/totals";
import { useRouter } from "expo-router";

export default function CurrencyScreen() {
  const router = useRouter();
  const { entries, qualifications } = useLogbook();
  const today = formatDate(new Date());
  const checks = checkAllCurrency(entries, qualifications, today);

  return (
    <Screen>
      <Text style={styles.title}>CURRENCY</Text>
      <Text style={styles.sub}>As of {today} · FAR 61.56 / 61.57</Text>

      {checks.map((c) => (
        <Card key={c.id} style={{ borderColor: STATUS_COLORS[c.status] }}>
          <View style={styles.head}>
            <View style={[styles.dot, { backgroundColor: STATUS_COLORS[c.status] }]} />
            <Text style={styles.label}>{c.label}</Text>
            <Text style={[styles.status, { color: STATUS_COLORS[c.status] }]}>
              {c.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.rule}>{c.rule}</Text>
          <Text style={styles.detail}>{c.detail}</Text>
          <Text style={styles.needed}>{c.needed}</Text>
          {c.expiresOn ? (
            <Text style={styles.expires}>Expires {c.expiresOn}</Text>
          ) : null}
        </Card>
      ))}

      <SecondaryButton
        title="Manage qualifications (medical, flight review)"
        onPress={() => router.push("/qualifications")}
      />
      <SecondaryButton
        title="Log a flight to stay current"
        onPress={() => router.push("/entry/new")}
      />
      <Text style={styles.footnote}>
        Night landings are counted as full-stop. Instrument currency also
        requires intercepting and tracking courses — confirm that yourself
        when you log approaches.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  sub: { color: COLORS.muted, fontSize: 13, marginBottom: 14, marginTop: 2 },
  head: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  label: { color: COLORS.text, fontSize: 16, fontWeight: "800", flex: 1 },
  status: { fontSize: 12, fontWeight: "800" },
  rule: { color: COLORS.muted, fontSize: 12, marginTop: 8 },
  detail: { color: COLORS.text, fontSize: 14, marginTop: 4 },
  needed: { color: COLORS.accent, fontSize: 14, marginTop: 4 },
  expires: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  footnote: { color: COLORS.faint, fontSize: 12, marginTop: 12, lineHeight: 17 },
});
