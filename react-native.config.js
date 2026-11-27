// React Native CLI / codegen config.
//
// Default (every normal invocation — iOS, Android, web, Metro, Expo
// autolinking): EMPTY. Nothing below changes any existing build.
//
// The single exception is the macOS pilot's `pod install`. macos/
// Podfile sets FLIGHTJOURNAL_MACOS_POD_INSTALL=1 before any tooling
// runs, and that environment variable is inherited by every process
// CocoaPods spawns (the `react-native config` autolinking call and
// the codegen script). Only then does this file return the override
// below. The iOS Podfile never sets the variable, so iOS codegen and
// autolinking see exactly the empty config — react-native-screens
// stays fully linked and code-generated on iOS/Android.
//
// WHY THE OVERRIDE EXISTS (macOS pilot, Nov 27, 2026):
// The Mac target builds with react-native-macos 0.83, whose codegen
// parser predates syntax that react-native-screens 4.26's Fabric
// specs use (e.g. `React.ComponentRef<...>` as a command argument in
// the gamma stack-header spec — the 0.83 parser only accepts
// `React.ElementRef<...>`). Codegen runs during `pod install` and
// aborts on that spec, killing the whole install. Separately,
// react-native-screens' podspec declares only ios/tvos/visionos —
// it can never link into a macOS target (CocoaPods autolinking
// already skips it for this target), and the Mac UI never renders
// screens' native components (sidebar + <Slot /> layout; the Metro
// config stubs its JS-side native components for macos bundles).
// So for the Mac build — and only the Mac build — screens is
// excluded from Apple-platform autolinking/codegen by setting its
// `ios` platform config to null (the RN CLI's documented disable
// mechanism). The macOS codegen run is invoked with the ios target
// platform (react-native-macos reuses the iOS codegen path), and
// its executor drops any library whose platforms.ios is null from
// codegen generation. No other library is touched.
const isMacosPodInstall =
  process.env.FLIGHTJOURNAL_MACOS_POD_INSTALL === '1';

module.exports = isMacosPodInstall
  ? {
      dependencies: {
        'react-native-screens': {
          platforms: {
            ios: null,
          },
        },
      },
    }
  : {};
