/**
 * BackButton — the one back pattern for every non-tab screen.
 *
 * The root Stack runs with headerShown: false, so screens that don't
 * render their own back control strand the user (worst on web, where
 * there is no gesture or hardware back). This row goes at the top of
 * every screen that isn't a root tab: it pops the stack when there is
 * somewhere to go back to, and falls back to a sensible parent route
 * when the screen was landed on directly (e.g. a web deep link).
 */
import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../lib/theme";

export function BackButton({
  fallback = "/(tabs)",
  label = "Back",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();
  const onPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback as never);
    }
  };
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.text}>‹ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { alignSelf: "flex-start", paddingVertical: 6, marginBottom: 6 },
  text: { color: COLORS.accent, fontSize: 16, fontWeight: "700" },
});
