/**
 * Cross-platform dialogs.
 *
 * React Native's Alert.alert is a no-op on web (react-native-web ships
 * an empty implementation), so any confirm or message built on it
 * silently does nothing in the browser — that is why Delete flight and
 * Clear all data appeared dead on the web version. These helpers keep
 * the native Alert experience on iOS/Android and use the browser's
 * built-in dialogs on web.
 */
import { Alert, Platform } from "react-native";

function webText(title: string, message?: string): string {
  return message ? `${title}\n\n${message}` : title;
}

/** Fire-and-forget message (one OK button). */
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === "web") {
    try {
      window.alert(webText(title, message));
    } catch {
      // No dialog available — nothing else sensible to do.
    }
    return;
  }
  Alert.alert(title, message);
}

/**
 * Message with a single action button; resolves when the user taps it
 * (native) or dismisses the dialog (web).
 */
export function alertAction(
  title: string,
  message: string | undefined,
  actionText: string,
): Promise<void> {
  if (Platform.OS === "web") {
    try {
      window.alert(webText(title, message));
    } catch {
      // Fall through — treat as dismissed.
    }
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [{ text: actionText, onPress: () => resolve() }], {
      cancelable: false,
    });
  });
}

/**
 * Yes/no confirmation. Resolves true when the user confirms.
 * Native: Alert with Cancel + confirm (destructive styling supported).
 * Web: window.confirm.
 */
export function confirmAction(opts: {
  title: string;
  message?: string;
  confirmText: string;
  cancelText?: string;
  destructive?: boolean;
}): Promise<boolean> {
  if (Platform.OS === "web") {
    try {
      return Promise.resolve(window.confirm(webText(opts.title, opts.message)));
    } catch {
      return Promise.resolve(false);
    }
  }
  return new Promise((resolve) => {
    Alert.alert(opts.title, opts.message, [
      {
        text: opts.cancelText ?? "Cancel",
        style: "cancel",
        onPress: () => resolve(false),
      },
      {
        text: opts.confirmText,
        style: opts.destructive ? "destructive" : "default",
        onPress: () => resolve(true),
      },
    ]);
  });
}
