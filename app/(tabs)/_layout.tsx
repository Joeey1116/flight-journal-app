import React from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";

/**
 * Bottom navigation is the OS's OWN tab bar (UITabBar on iOS, the
 * Material navigation bar on Android) — on iOS 26 the system draws it
 * as the floating Liquid Glass capsule, the genuine Apple article.
 * Mirrors the Motivation app's (tabs) layout 1:1 (same expo-router /
 * react-native-screens versions), with Flight Journal's tab set and
 * cyan branding in place of Motivation's theme palette.
 *
 * TAB BAR BACKGROUND (mirrors Motivation build 34, Nov 24, 2026,
 * on device): a solid bar showed behind the floating glass capsule —
 * the native tab bar's opaque background, forced by
 * `disableTransparentOnScrollEdge` on every trigger. That prop is NOT
 * used here, and the bar's background is set transparent, so only the
 * Liquid Glass capsule shows and the screen shows through around it.
 *
 * FOLLOW-UP (mirrors Motivation commit f6dcaf9, build 35, on device):
 * on scrolled tabs a frosted box still showed behind the capsule,
 * because a scrolled tab uses the STANDARD appearance, whose blur
 * defaults to the system material — a full-width frosted panel.
 * Fix: blurEffect "none" + shadowColor "transparent" on the
 * navigator, so the standard appearance has no blur and no shadow
 * line either. The capsule itself keeps its own system glass; only
 * the panel goes. The thin light rim tracing the pill is the
 * capsule's own glass edge and cannot be removed.
 *
 * No session guard: accounts were removed Nov 27, 2026 — the app
 * opens straight into the logbook. The launch gate (app/index.tsx)
 * sends first-run users through onboarding once, then here.
 *
 * Tabs: Dashboard / Logbook / Currency / Stats / More.
 */
export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor="transparent"
      blurEffect="none"
      shadowColor="transparent"
      tintColor="#22D3EE"
      iconColor={{ default: "#666666", selected: "#22D3EE" }}
      labelStyle={{
        default: { color: "#666666", fontWeight: "500" },
        selected: { color: "#22D3EE", fontWeight: "700" },
      }}
    >
      <NativeTabs.Trigger
        name="index"
        contentStyle={{ backgroundColor: "#05070D" }}
      >
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gauge.with.dots.needle.33percent", selected: "gauge.with.dots.needle.67percent" }}
          md="dashboard"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="logbook"
        contentStyle={{ backgroundColor: "#05070D" }}
      >
        <NativeTabs.Trigger.Label>Logbook</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "book", selected: "book.fill" }}
          md="book"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="currency"
        contentStyle={{ backgroundColor: "#05070D" }}
      >
        <NativeTabs.Trigger.Label>Currency</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "checkmark.shield", selected: "checkmark.shield.fill" }}
          md="verified"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="stats"
        contentStyle={{ backgroundColor: "#05070D" }}
      >
        <NativeTabs.Trigger.Label>Stats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          md="bar_chart"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="more"
        contentStyle={{ backgroundColor: "#05070D" }}
      >
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "ellipsis.circle", selected: "ellipsis.circle.fill" }}
          md="more_horiz"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
