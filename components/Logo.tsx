import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../lib/theme";

/**
 * Logo — rounded dark panel with a cyan airplane glyph.
 * Used on the splash and onboarding screens.
 */
export function Logo({ size = 96 }: { size?: number }) {
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.24 }]}>
      <MaterialCommunityIcons
        name="airplane"
        size={size * 0.52}
        color={COLORS.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
