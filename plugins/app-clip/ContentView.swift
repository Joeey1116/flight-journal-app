import StoreKit
import SwiftUI

// MARK: - App Store ID
// App Store Connect ID 6835242780 (Joey, Nov 24, 2026) — the
// "Get the full app" overlay is live.
private let appStoreID = "6835242780"

// MARK: - View

/// The Flight Journal App Clip: a tiny, dependency-free SwiftUI app — it does
/// NOT embed React Native (a React Native clip is ~40 MB thinned, over
/// Apple's 15 MB App Clip limit; ITMS-90865 hit Motivation's RN clip,
/// Nov 10 2026).
///
/// The clip shows a small taste of the logbook — what a pilot's hours and
/// currency look like at a glance — and hands the user off to the full app
/// (App Store overlay / deep link), nothing more.
struct ContentView: View {
  /// The URL that launched this clip, if any (App Clip Code / link).
  let invocationURL: URL?

  @State private var showAppStoreOverlay = false

  var body: some View {
    ZStack {
      Color(red: 0.02, green: 0.03, blue: 0.06).ignoresSafeArea()
      ScrollView {
        VStack(spacing: 28) {
          header
          teaserSection
          actionsSection
          footer
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 32)
      }
    }
    .preferredColorScheme(.dark)
    .appStoreOverlay(isPresented: $showAppStoreOverlay) {
      SKOverlay.AppConfiguration(appIdentifier: appStoreID, position: .bottom)
    }
  }

  private var header: some View {
    VStack(spacing: 10) {
      Text("✈️")
        .font(.system(size: 44))
      Text("FLIGHT JOURNAL")
        .font(.system(size: 22, weight: .black))
        .tracking(3)
        .foregroundColor(.white)
      Text("Every hour. Every landing. Always current.")
        .font(.system(size: 15, weight: .medium))
        .foregroundColor(Color(white: 0.65))
        .multilineTextAlignment(.center)
    }
  }

  private var teaserSection: some View {
    VStack(spacing: 12) {
      teaserRow(label: "Total time", value: "1,247.5 hrs")
      teaserRow(label: "Last 90 days", value: "42.3 hrs")
      teaserRow(label: "Day currency", value: "Current ✓", good: true)
      teaserRow(label: "Night currency", value: "2 landings to go", good: false)
    }
    .padding(16)
    .background(Color(white: 0.08))
    .cornerRadius(16)
  }

  private func teaserRow(label: String, value: String, good: Bool? = nil) -> some View {
    HStack {
      Text(label)
        .font(.system(size: 15, weight: .medium))
        .foregroundColor(Color(white: 0.65))
      Spacer()
      Text(value)
        .font(.system(size: 15, weight: .bold))
        .foregroundColor(good == true ? Color(red: 0.3, green: 0.85, blue: 0.5) : (good == false ? Color(red: 1.0, green: 0.75, blue: 0.3) : .white))
    }
  }

  private var actionsSection: some View {
    VStack(spacing: 12) {
      // TODO: wire the deep link (flightjournal://) once the main app's
      // link handling is in place. For now the clip is a teaser only.
      if !appStoreID.isEmpty {
        Button("Get the Full App") {
          showAppStoreOverlay = true
        }
        .font(.system(size: 17, weight: .bold))
        .foregroundColor(.black)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color(red: 0.13, green: 0.83, blue: 0.93))
        .cornerRadius(12)
      }
      Text("Log flights, track currency, export your logbook.")
        .font(.system(size: 14))
        .foregroundColor(Color(white: 0.55))
        .multilineTextAlignment(.center)
    }
  }

  private var footer: some View {
    Text("Flight Journal · Free to start, Pro unlocks unlimited logging, export & cloud sync.")
      .font(.system(size: 12))
      .foregroundColor(Color(white: 0.45))
      .multilineTextAlignment(.center)
  }
}
