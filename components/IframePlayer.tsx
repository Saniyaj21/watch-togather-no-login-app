import React, { useRef, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useRoom } from "../contexts/RoomContext";
import { INJECTED_JS } from "../lib/webviewBridge";

type Props = { url: string };

const escapeHTML = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");

const buildHTML = (url: string) => {
  const safeUrl = escapeHTML(url);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <iframe
    src="${safeUrl}"
    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
    allowfullscreen
    frameborder="0"
    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
  ></iframe>
  <script>
    // Block all navigation attempts
    window.addEventListener('beforeunload', function(e) { e.preventDefault(); });
    // Block window.open
    window.open = function() { return null; };
    // Block top-level redirects
    if (window.top !== window.self) { /* inside iframe, ok */ }
  </script>
</body>
</html>
`;
};

export default function IframePlayer({ url }: Props) {
  const webviewRef = useRef<WebView>(null);
  const { state, playVideo, pauseVideo, seekVideo } = useRoom();
  const syncLockRef = useRef(false);

  // Sync playback state from socket events to WebView
  useEffect(() => {
    if (!webviewRef.current) return;
    syncLockRef.current = true;

    if (state.isPlaying) {
      webviewRef.current.injectJavaScript(`window._wtPlay(${state.currentTime}); true;`);
    } else {
      webviewRef.current.injectJavaScript(`window._wtPause(${state.currentTime}); true;`);
    }

    setTimeout(() => { syncLockRef.current = false; }, 500);
  }, [state.isPlaying, state.currentTime]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    if (syncLockRef.current) return;
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case "play":
          playVideo(data.currentTime);
          break;
        case "pause":
          pauseVideo(data.currentTime);
          break;
        case "seek":
          seekVideo(data.currentTime);
          break;
        case "timeupdate": {
          // Drift correction — if >2s off, re-seek
          const drift = Math.abs(data.currentTime - state.currentTime);
          if (drift > 2) {
            webviewRef.current?.injectJavaScript(`window._wtSeek(${state.currentTime}); true;`);
          }
          break;
        }
      }
    } catch {}
  }, [playVideo, pauseVideo, seekVideo, state.currentTime]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ html: buildHTML(url) }}
        injectedJavaScript={INJECTED_JS}
        style={styles.webview}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        originWhitelist={["*"]}
        mixedContentMode="always"
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={(request) => {
          // Allow the initial HTML and the iframe src to load
          // Block everything else (ads, redirects, external links)
          if (request.url === "about:blank") return true;
          if (request.url.startsWith("data:")) return true;
          if (request.mainDocumentURL === undefined || request.mainDocumentURL === "") return true;
          if (request.url === url) return true;
          if (request.url.includes(new URL(url).hostname)) return true;
          return false;
        }}
        onNavigationStateChange={(navState) => {
          // If WebView tries to navigate away, force it back
          if (navState.url !== "about:blank" && !navState.url.startsWith("data:") && !navState.url.includes(new URL(url).hostname)) {
            webviewRef.current?.stopLoading();
            webviewRef.current?.injectJavaScript(`window.location = "about:blank"; true;`);
            webviewRef.current?.injectJavaScript(`
              document.open();
              document.write(${JSON.stringify(buildHTML(url))});
              document.close();
              true;
            `);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 220, backgroundColor: "#000" },
  webview: { flex: 1, backgroundColor: "#000" },
});
