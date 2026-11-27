import { Ionicons } from '@expo/vector-icons';
import { Slot, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../lib/theme';

/**
 * macOS variant of the (tabs) layout — Metro resolves this file instead
 * of _layout.tsx for platform === 'macos'; iOS/Android/web are
 * untouched.
 *
 * NativeTabs (Liquid Glass) is iOS-only and has no macOS renderer, so
 * the desktop window gets a plain left SIDEBAR instead: the same five
 * tabs, same labels/icons, rendered as a vertical nav next to the
 * matched screen (<Slot />). Navigation goes through the router with
 * the same group hrefs the rest of the app already uses (see
 * TARGET_ROUTES in app/_layout.tsx). Plainer than the phone UI by
 * design — a functional desktop window over the same screens and the
 * same on-device data.
 */

interface TabDef {
  href: string;
  match: (pathname: string) => boolean;
  label: string;
  ion: { focused: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap };
}

const TABS: TabDef[] = [
  {
    href: '/(tabs)',
    match: (p) => p === '/' || p === '/index',
    label: 'Dashboard',
    ion: { focused: 'speedometer', outline: 'speedometer-outline' },
  },
  {
    href: '/(tabs)/logbook',
    match: (p) => p.startsWith('/logbook'),
    label: 'Logbook',
    ion: { focused: 'book', outline: 'book-outline' },
  },
  {
    href: '/(tabs)/currency',
    match: (p) => p.startsWith('/currency'),
    label: 'Currency',
    ion: { focused: 'shield-checkmark', outline: 'shield-checkmark-outline' },
  },
  {
    href: '/(tabs)/stats',
    match: (p) => p.startsWith('/stats'),
    label: 'Stats',
    ion: { focused: 'bar-chart', outline: 'bar-chart-outline' },
  },
  {
    href: '/(tabs)/more',
    match: (p) => p.startsWith('/more'),
    label: 'More',
    ion: { focused: 'ellipsis-horizontal-circle', outline: 'ellipsis-horizontal-circle-outline' },
  },
];

export default function TabsLayoutMacOS() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      <View style={styles.sidebar}>
        <Text style={styles.brand}>Flight Journal</Text>
        {TABS.map((tab) => {
          const focused = tab.match(pathname);
          return (
            <Pressable
              key={tab.href}
              onPress={() => router.navigate(tab.href as never)}
              style={[styles.item, focused && styles.itemActive]}
            >
              <Ionicons
                name={focused ? tab.ion.focused : tab.ion.outline}
                size={19}
                color={focused ? COLORS.accent : COLORS.muted}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.bg },
  sidebar: {
    width: 216,
    backgroundColor: COLORS.panel,
    borderRightColor: COLORS.border,
    borderRightWidth: 1,
    paddingTop: 28,
    paddingHorizontal: 12,
    gap: 4,
  },
  brand: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingBottom: 18,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 9,
  },
  itemActive: { backgroundColor: COLORS.panel2 },
  label: { color: COLORS.muted, fontSize: 14, fontWeight: '500' },
  labelActive: { color: COLORS.accent, fontWeight: '700' },
  content: { flex: 1, backgroundColor: COLORS.bg },
});
