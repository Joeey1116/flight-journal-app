import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "../lib/supabase";

/**
 * AppleSignInButton — Sign in with Apple, rendered only when the native
 * module is available (iOS only, and never statically assumed: the
 * component checks availability first so web/Android never break).
 *
 * On success the Supabase session is established via signInWithIdToken.
 * Failures surface through onError so the screen can show them.
 */
export function AppleSignInButton({
  onError,
}: {
  onError?: (message: string) => void;
}) {
  const [available, setAvailable] = useState(false);

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
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });
            if (!credential.identityToken || !supabase) {
              onError?.("Apple sign-in did not return a token. Try email instead.");
              return;
            }
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "apple",
              token: credential.identityToken,
            });
            if (error) onError?.(error.message);
          } catch (e: unknown) {
            const err = e as { code?: string; message?: string };
            if (err?.code === "ERR_REQUEST_CANCELED") return;
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
