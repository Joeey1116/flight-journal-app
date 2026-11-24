import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { SIGN_IN_CANCELLED_CODE, useAuth } from "../lib/auth";

/**
 * AppleSignInButton — Sign in with Apple, rendered only when the native
 * module is available (iOS only, and never statically assumed: the
 * component checks availability first so web/Android never break).
 *
 * The sheet + Firebase session are owned by AuthProvider (lib/auth):
 * this button just calls signInWithApple() and surfaces real failures
 * through onError so the screen can show them. A dismissed sheet is
 * swallowed silently — cancelling is not an error.
 *
 * (Nov 24, 2026: the old version called Supabase signInWithIdToken
 * directly and, with no Supabase configured, the Apple sheet completed
 * and then nothing happened — the failure had nowhere to go on the
 * sign-up screen, which passed no onError at all. Both screens now
 * pass onError, so Apple failures are always visible.)
 */
export function AppleSignInButton({
  onError,
}: {
  onError?: (message: string) => void;
}) {
  const [available, setAvailable] = useState(false);
  const { signInWithApple } = useAuth();

  useEffect(() => {
    let alive = true;
    AppleAuthentication.isAvailableAsync()
      .then((ok) => {
        if (alive) setAvailable(ok);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (Platform.OS !== "ios" || !available) return null;

  return (
    <View style={styles.wrap}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
        cornerRadius={12}
        style={styles.button}
        onPress={async () => {
          try {
            await signInWithApple();
          } catch (e: unknown) {
            const err = e as { code?: string; message?: string };
            if (err?.code === SIGN_IN_CANCELLED_CODE) return;
            onError?.(err?.message ?? "Apple sign-in failed. Try email instead.");
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12 },
  button: { width: "100%", height: 48 },
});
