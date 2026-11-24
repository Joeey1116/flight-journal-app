import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Logo } from '../components/Logo';
import { useAuth } from '../lib/auth';

/**
 * Auth gate: branded splash while AuthProvider restores the session,
 * then route on the resolved state — signed-in users to the tabs,
 * everyone else to onboarding. The gate no longer polls getSession():
 * the provider's restore already includes the persisted Firebase
 * session, so when status resolves, the answer is final. Sign back in
 * via the provider's transitions if a session appears later.
 * (Firebase auth has no deep-link flows — confirmation and password
 * reset complete on Firebase-hosted web pages — so there is no
 * deep-link branch here anymore.)
 */
export default function AuthGate() {
  const { status } = useAuth();
  const [minSplashDone, setMinSplashDone] = useState(false);

  // Let the branding breathe for a moment.
  useEffect(() => {
    const t = setTimeout(() => setMinSplashDone(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status === 'loading' || !minSplashDone) return;
    if (status === 'signedIn') {
      router.replace('/(tabs)');
      return;
    }
    router.replace('/onboarding');
  }, [status, minSplashDone]);

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
