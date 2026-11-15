import React from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useAuth } from "../../lib/auth";

/**
 * Bottom navigation is the OS's OWN tab bar (UITabBar on iOS, the
 * Material navigation bar on Android) instead of a hand-drawn pill.
 * On iOS 26 the system draws it as the floating Liquid Glass capsule —
 * the genuine article, rendered by Apple, not an imitation.
 * (Copied 1:1 from the proven Rewards/Snugbug setup, same
 * expo-router/react-native-screens versions; tab names adapted.)
 *
 * Session guard: the tabs exist ONLY behind a real signed-in session.
 * Any route that lands here without one is bounced to onboarding.
 * While the provider is still restoring the session, render the black
 * backdrop instead of flashing either the tabs or a redirect.
 *
 * Tabs: Dashboard / Logbook / Currency / Stats / More.
 */
export default function TabsLayout() {
  const { status } = useAuth();

  if (status === "loading") {
    return <View style={{ flex: 1, backgroundColor: "#05070D" }} />;
  }
  if (status !== "signedIn") {
    return <Redirect href="/onboarding" />;
  }

  return (
    <NativeTabs
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
        disableTransparentOnScrollEdge
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
        disableTransparentOnScrollEdge
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
        disableTransparentOnScrollEdge
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
        disableTransparentOnScrollEdge
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
        disableTransparentOnScrollEdge
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
