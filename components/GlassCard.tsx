import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { COLORS } from "../lib/theme";

/**
 * GlassCard — panel card with a subtle top highlight, matching the
 * Liquid Glass feel of the other apps' cards. Plain View-based (no
 * expo-blur dependency at render time) so it works on web too.
 */
export function GlassCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
});
