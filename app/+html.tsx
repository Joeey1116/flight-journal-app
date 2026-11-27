import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { ReactNode } from 'react';

// Web-only root HTML (expo-router +html). Adds the PWA manifest link and
// the iOS "Add to Home Screen" web-app meta tags so the exported site
// installs like an app on iPhone / iPad and on Android/Chrome.
// headNodes/bodyNodes from useServerDocumentContext() carry the generated
// metadata, styles and the JavaScript bundles required for hydration —
// without them the exported pages never load the app. (Verified against
// the installed expo-router 57 build, whose ServerDocument exposes the
// same context shape; the export's index.html is checked for bundle
// <script> tags after every export.)
export default function Root({ children }: { children: ReactNode }) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } =
    useServerDocumentContext();

  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <title>Flight Journal</title>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* iOS home-screen app behavior */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Flight Journal" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: backgroundCss }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}

const backgroundCss = `
body {
  background-color: #05070D;
}
/* Fill the real (dynamic) viewport height on mobile browsers: with the
   old 100%-only chain the app could end up shorter than the visible
   screen on iOS, leaving dead space under the content. */
html, body {
  height: 100%;
}
#root {
  height: 100%;
}
@supports (height: 100dvh) {
  #root {
    height: 100dvh;
  }
}`;
