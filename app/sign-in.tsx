import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../components/Screen';
import { Logo } from '../components/Logo';
import { EMAIL_NOT_VERIFIED_CODE, useAuth } from '../lib/auth';
import { AppleSignInButton } from '../components/AppleSignInButton';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [forgotSending, setForgotSending] = useState(false);
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const [showResend, setShowResend] = useState(false);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { signInWithEmail, sendPasswordReset, resendVerificationEmail } = useAuth();

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldownSecs(60);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldownSecs((s) => {
        if (s <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    const target = email.trim();
    if (!target || resending || cooldownSecs > 0) return;
    setResending(true);
    setError('');
    try {
      // Firebase: the user is already signed in (an unverified sign-in
      // keeps the Firebase session), so this resends to that account.
      await resendVerificationEmail();
      setInfo(`Confirmation email resent to ${target} — tap the link in the email, then sign in here. Check your inbox and spam folder.`);
      startCooldown();
    } catch {
      setError('Could not resend the email. Check your connection and try again.');
    } finally {
      setResending(false);
    }
  };

  const handleForgotPassword = async () => {
    const target = email.trim();
    setError('');
    setInfo('');
    setShowResend(false);
    if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      setError('Enter your email above first so we know where to send the reset link.');
      return;
    }
    setForgotSending(true);
    try {
      // Firebase sends a link to a Firebase-hosted page where the user
      // chooses the new password — no deep link back into the app.
      await sendPasswordReset(target);
      setInfo(`Password reset email sent to ${target} — tap the link in the email to choose a new password, then sign in here. Check your inbox and spam folder.`);
    } catch {
      setError('Could not send the reset email. Check your connection and try again.');
    } finally {
      setForgotSending(false);
    }
  };

  const handleSignIn = async () => {    setError('');
    setInfo('');
    setShowResend(false);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      // Unverified email: the account exists and stays signed in to
      // Firebase so the confirmation email can be resent — show that
      // flow instead of a generic error.
      if (err?.code === EMAIL_NOT_VERIFIED_CODE) {
        setInfo(
          `Your email isn\u2019t confirmed yet. We sent the link to ${email.trim()} — tap it in your email, then sign in here. Check your inbox and spam folder, or resend it below.`
        );
        setShowResend(true);
      } else {
        setError(err?.message ?? 'Could not sign you in. Check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Logo size={72} />
        <Text style={styles.headline}>WELCOME BACK.</Text>
        <Text style={styles.subline}>Your friend missed you.</Text>
      </View>

      <Text style={styles.label}>EMAIL</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor="#555555"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>PASSWORD</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        placeholderTextColor="#555555"
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleForgotPassword}
        disabled={forgotSending}
        style={styles.forgot}
        activeOpacity={0.8}
      >
        {forgotSending ? (
          <ActivityIndicator color="#aaaaaa" size="small" />
        ) : (
          <Text style={styles.forgotText}>Forgot password?</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}

      {showResend && (
        <TouchableOpacity
          style={[styles.resend, (resending || cooldownSecs > 0) && styles.primaryDisabled]}
          onPress={handleResend}
          disabled={resending || cooldownSecs > 0}
          activeOpacity={0.8}
        >
          {resending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.resendText}>
              {cooldownSecs > 0 ? `RESEND AVAILABLE IN ${cooldownSecs}s` : 'RESEND CONFIRMATION EMAIL'}
            </Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.primary, loading && styles.primaryDisabled]}
        onPress={handleSignIn}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryText}>SIGN IN</Text>}
      </TouchableOpacity>

      <AppleSignInButton onError={setError} />

      <TouchableOpacity onPress={() => router.replace('/sign-up')} style={styles.switch}>
        <Text style={styles.switchText}>New here? Meet Flight Journal</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 32, marginBottom: 28 },
  headline: { color: '#ffffff', fontSize: 30, fontWeight: '800', letterSpacing: 1, marginTop: 18 },
  subline: { color: '#888888', fontSize: 15, fontStyle: 'italic', marginTop: 8 },
  label: { color: '#888888', fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: '#111111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  error: { color: '#ff8888', fontSize: 14, marginTop: 8, marginBottom: 4 },
  info: { color: '#aaddff', fontSize: 14, marginTop: 8, lineHeight: 20 },
  primary: { backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginTop: 16 },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { color: '#000000', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  resend: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  resendText: { color: '#ffffff', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  switch: { alignItems: 'center', marginTop: 18 },
  switchText: { color: '#aaaaaa', fontSize: 14, fontWeight: '600' },
  forgot: { alignItems: 'flex-end', marginTop: 2, marginBottom: 4, paddingVertical: 4 },
  forgotText: { color: '#aaaaaa', fontSize: 14, fontWeight: '600' },
});
