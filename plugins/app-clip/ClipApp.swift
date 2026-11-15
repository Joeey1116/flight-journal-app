import SwiftUI

/// Entry point for the Flight Journal App Clip
/// (com.beatrackfaminc.flightjournal.FlightJournal).
///
/// The clip is a deliberately tiny, dependency-free SwiftUI app — it does NOT
/// embed React Native. The proven clip shape (Snugbug, Nov 10 2026) is a
/// few MB thinned, well under Apple's 15 MB App Clip limit
/// (a React Native clip was 40 MB and got ITMS-90865).
///
/// The clip is generated into ios/FlightJournalClip by the
/// `plugins/with-app-clip` config plugin on every `expo prebuild`; edit the
/// templates under `plugins/app-clip/`, never the generated copy.
@main
struct FlightJournalClipApp: App {
  @State private var invocationURL: URL?

  var body: some Scene {
    WindowGroup {
      ContentView(invocationURL: invocationURL)
        // App Clip invocation: the URL from the App Clip Code / NFC tag /
        // link that launched the clip (configured as an App Clip experience
        // in App Store Connect).
        .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
          if let url = activity.webpageURL {
            invocationURL = url
          }
        }
        .onOpenURL { url in
          invocationURL = url
        }
    }
  }
}
