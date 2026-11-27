import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { COLORS } from '../../lib/theme';

/**
 * Bottom navigation — the OS's OWN tab bar on native, a glass bar on web.
 *
 * NATIVE: UITabBar on iOS, the Material navigation bar on Android — on
 * iOS 26 the system draws it as the floating Liquid Glass capsule, the
 * genuine Apple article. Mirrors the Motivation app's (tabs) layout 1:1
 * (same expo-router / react-native-screens versions), with Flight
 * Journal's tab set and cyan branding in place of Motivation's palette.
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
 * WEB: NativeTabs has no web renderer (its fallback drew a stray tab
 * strip across the TOP of the page, overlapping the header), so the
 * web build uses JS Tabs with a custom glass bar. Rules, mirroring
 * the SimDeck web fix:
 *  - NO navigator header on web (`headerShown: false`): the React
 *    Navigation header leaks a stray route title at the top of the
 *    installed PWA. Screens render their own titles.
 *  - The bar renders in normal layout flow at the bottom of the tab
 *    navigator's column, so it sits flush on the bottom edge of the
 *    screen and the scene takes the remaining height — no dead gap,
 *    no content "scrolled up". The safe-area inset is INTERNAL
 *    padding (paddingBottom), so the glass background extends through
 *    the home-indicator area while the icons stay clear of it.
 *  - SDK NOTE: this project is on expo-router 57, whose vendored
 *    React Navigation passes the CLASSIC tab-bar props
 *    ({ state, descriptors, navigation, insets }) — press handling
 *    below mirrors the default BottomTabBar (navigation.emit
 *    'tabPress', then navigation.navigate). SDK 58's
 *    { emitter, navigateToTab } shape does NOT apply here.
 *
 * No session guard: accounts were removed Nov 27, 2026 — the app
 * opens straight into the logbook. The launch gate (app/index.tsx)
 * sends first-run users through onboarding once, then here.
 *
 * Tabs: Dashboard / Logbook / Currency / Stats / More.
 */

const TAB_ACTIVE = COLORS.accent;
const TAB_INACTIVE = COLORS.muted;
const BAR_BG = '#05070D';

interface TabDef {
  name: string;
  label: string;
  title: string;
  ion: { focused: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap };
}

const TABS: TabDef[] = [
  { name: 'index', label: 'Dashboard', title: 'Dashboard', ion: { focused: 'speedometer', outline: 'speedometer-outline' } },
  { name: 'logbook', label: 'Logbook', title: 'Logbook', ion: { focused: 'book', outline: 'book-outline' } },
  { name: 'currency', label: 'Currency', title: 'Currency', ion: { focused: 'shield-checkmark', outline: 'shield-checkmark-outline' } },
  { name: 'stats', label: 'Stats', title: 'Stats', ion: { focused: 'bar-chart', outline: 'bar-chart-outline' } },
  { name: 'more', label: 'More', title: 'More', ion: { focused: 'ellipsis-horizontal-circle', outline: 'ellipsis-horizontal-circle-outline' } },
];

function NativeTabsLayout() {
  return (
    <NativeTabs
      backgroundColor="transparent"
      blurEffect="none"
      shadowColor="transparent"
      tintColor="#22D3EE"
      iconColor={{ default: '#666666', selected: '#22D3EE' }}
      labelStyle={{
        default: { color: '#666666', fontWeight: '500' },
        selected: { color: '#22D3EE', fontWeight: '700' },
      }}
    >
      <NativeTabs.Trigger name="index" contentStyle={{ backgroundColor: BAR_BG }}>
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gauge.with.dots.needle.33percent', selected: 'gauge.with.dots.needle.67percent' }}
          md="dashboard"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="logbook" contentStyle={{ backgroundColor: BAR_BG }}>
        <NativeTabs.Trigger.Label>Logbook</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} md="book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="currency" contentStyle={{ backgroundColor: BAR_BG }}>
        <NativeTabs.Trigger.Label>Currency</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'checkmark.shield', selected: 'checkmark.shield.fill' }}
          md="verified"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stats" contentStyle={{ backgroundColor: BAR_BG }}>
        <NativeTabs.Trigger.Label>Stats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} md="bar_chart" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more" contentStyle={{ backgroundColor: BAR_BG }}>
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'ellipsis.circle', selected: 'ellipsis.circle.fill' }}
          md="more_horiz"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

/* ------------------------------------------------------------------ */
/* Web glass bar                                                       */
/* ------------------------------------------------------------------ */

interface GlassBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: string; target: string; canPreventDefault: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
  insets: { top: number; right: number; bottom: number; left: number };
}

function GlassTabBar({ state, navigation, insets }: GlassBarProps) {
  const barStyle: ViewStyle = {
    // Safe-area inset as INTERNAL padding: the glass background runs to
    // the very bottom edge of the screen (home-indicator area included)
    // while the icons stay clear of the indicator.
    paddingBottom: Math.max(insets.bottom, 8),
    // Web-only CSS: real backdrop blur for the glass effect. React Native
    // Web passes it through; native never renders this component.
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(18px) saturate(160%)' } as ViewStyle) : null),
  };
  return (
    <View style={[styles.glassBar, barStyle]}>
      {state.routes.map((route, i) => {
        const def = TABS.find((t) => t.name === route.name) ?? TABS[0];
        const focused = state.index === i;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <Pressable key={route.key} onPress={onPress} style={styles.glassTab}>
            <Ionicons
              name={focused ? def.ion.focused : def.ion.outline}
              size={22}
              color={focused ? TAB_ACTIVE : TAB_INACTIVE}
            />
            <Text style={[styles.glassLabel, focused && styles.glassLabelActive]}>{def.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function WebTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...(props as unknown as GlassBarProps)} />}
      screenOptions={{
        // No header on web — it leaks a stray route title at the top of
        // the PWA. Screens render their own titles.
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.bg },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}

export default function TabsLayout() {
  if (Platform.OS === 'web') {
    return <WebTabsLayout />;
  }
  return <NativeTabsLayout />;
}

const styles = StyleSheet.create({
  glassBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 21, 38, 0.88)',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  glassTab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 2 },
  glassLabel: { color: TAB_INACTIVE, fontSize: 10, fontWeight: '500' },
  glassLabelActive: { color: TAB_ACTIVE, fontWeight: '700' },
});
