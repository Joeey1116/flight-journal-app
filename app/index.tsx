import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Logo } from '../components/Logo';
import { loadSettings } from '../lib/settings';

/**
 * Launch gate: branded splash, then route on the onboarding flag —
 * returning users straight into the logbook tabs, first-run users to
 * onboarding (welcome → value → Pro offer → tabs). There is no account
 * or session check: accounts were removed Nov 27, 2026, and the app
 * opens directly into the local logbook.
 */
export default function LaunchGate() {
  const [minSplashDone, setMinSplashDone] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Let the branding breathe for a moment.
  useEffect(() => {
    const t = setTimeout(() => setMinSplashDone(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadSettings().then((s) => {
      if (!cancelled) setOnboardingComplete(s.onboardingComplete);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!minSplashDone || onboardingComplete === null) return;
    router.replace(onboardingComplete ? '/(tabs)' : '/onboarding');
  }, [minSplashDone, onboardingComplete]);

  return (
    <View style={styles.wrap}>
      <Logo size={110} />
      <Text style={styles.title}>FLIGHT JOURNAL</Text>
      <Text style={styles.subtitle}>EVERY HOUR. EVERY LANDING.</Text>
      <Text style={styles.tagline}>The logbook that keeps you current.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '800', letterSpacing: 6, marginTop: 24 },
  subtitle: { color: '#888888', fontSize: 14, fontWeight: '800', letterSpacing: 10, marginTop: 6 },
  tagline: { color: '#555555', fontSize: 14, marginTop: 16, fontStyle: 'italic' },
});
