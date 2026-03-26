import React, { useRef, useCallback, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import YTPlayer from "react-native-youtube-iframe";
import { extractYouTubeId } from "../lib/videoUtils";
import { useRoom } from "../contexts/RoomContext";

type Props = { url: string };

export default function YouTubePlayer({ url }: Props) {
  const videoId = extractYouTubeId(url);
  const { state, playVideo, pauseVideo, seekVideo } = useRoom();
  const playerRef = useRef<any>(null);
  const syncLockRef = useRef(false);
  const [playerReady, setPlayerReady] = useState(false);

  // Sync playback state from socket events
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    const syncPlayback = async () => {
      syncLockRef.current = true;
      try {
        const elapsed = await playerRef.current.getCurrentTime();
        const diff = Math.abs(elapsed - state.currentTime);
        if (diff > 2) {
          playerRef.current.seekTo(state.currentTime, true);
        }
      } catch {}
      setTimeout(() => {
        syncLockRef.current = false;
      }, 500);
    };

    syncPlayback();
  }, [state.currentTime, state.isPlaying, playerReady]);

  const onStateChange = useCallback(
    (event: string) => {
      if (syncLockRef.current) return;

      if (event === "playing") {
        playerRef.current?.getCurrentTime().then((time: number) => {
          playVideo(time);
        });
      } else if (event === "paused") {
        playerRef.current?.getCurrentTime().then((time: number) => {
          pauseVideo(time);
        });
      }
    },
    [playVideo, pauseVideo]
  );

  if (!videoId) return null;

  return (
    <View style={styles.container}>
      <YTPlayer
        ref={playerRef}
        height={220}
        videoId={videoId}
        play={state.isPlaying}
        onChangeState={onStateChange}
        onReady={() => setPlayerReady(true)}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          onShouldStartLoadWithRequest: (request: any) => {
            // Only allow YouTube domains
            if (request.url.includes("youtube.com") || request.url.includes("ytimg.com") || request.url.includes("google.com") || request.url.includes("about:blank")) {
              return true;
            }
            return false;
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", overflow: "hidden" },
});
