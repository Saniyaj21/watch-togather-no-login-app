import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { YoutubeView, useYouTubePlayer, useYouTubeEvent, PlayerState } from "react-native-youtube-bridge";
import { extractYouTubeId } from "../lib/videoUtils";
import { useRoom } from "../contexts/RoomContext";

type Props = {
  url: string;
  onVideoEnd?: () => void;
};

export default function YouTubePlayer({ url, onVideoEnd }: Props) {
  const videoId = extractYouTubeId(url);
  const { state, playVideo, pauseVideo } = useRoom();
  const player = useYouTubePlayer(videoId ?? null, { controls: true, playsinline: true, autoplay: true });
  const syncLockRef = useRef(true); // Start locked so initial autoplay event doesn't broadcast to others

  // Push play/pause + seek from socket events directly into the player
  useEffect(() => {
    syncLockRef.current = true;

    if (state.isPlaying) {
      player.seekTo(state.currentTime, true);
      player.play();
    } else {
      player.seekTo(state.currentTime, true);
      player.pause();
    }

    const t = setTimeout(() => { syncLockRef.current = false; }, 1000);
    return () => clearTimeout(t);
  }, [state.isPlaying, state.currentTime]);

  // Detect user's own play/pause on this device → emit to socket
  useYouTubeEvent(player, "stateChange", async (playerState) => {
    if (syncLockRef.current) return;

    if (playerState === PlayerState.PLAYING) {
      const time = await player.getCurrentTime();
      playVideo(time ?? 0);
    } else if (playerState === PlayerState.PAUSED) {
      const time = await player.getCurrentTime();
      pauseVideo(time ?? 0);
    } else if (playerState === PlayerState.ENDED) {
      if (onVideoEnd) {
        onVideoEnd();
      }
    }
  }, [playVideo, pauseVideo, onVideoEnd]);

  if (!videoId) return null;

  return (
    <View style={styles.container}>
      <YoutubeView player={player} style={styles.player} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 220 },
  player: { flex: 1 },
});
