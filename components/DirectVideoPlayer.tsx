import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRoom } from "../contexts/RoomContext";

type Props = {
  url: string;
  onVideoEnd?: () => void;
};

export default function DirectVideoPlayer({ url, onVideoEnd }: Props) {
  const { state, playVideo, pauseVideo, seekVideo } = useRoom();
  const syncLockRef = useRef(false);
  const onVideoEndRef = useRef(onVideoEnd);
  onVideoEndRef.current = onVideoEnd;

  // Refs so event listeners always read the latest values without re-subscribing
  const currentTimeRef = useRef(state.currentTime);
  const isPlayingRef = useRef(state.isPlaying);
  currentTimeRef.current = state.currentTime;
  isPlayingRef.current = state.isPlaying;

  const player = useVideoPlayer({ uri: url }, (p) => {
    p.timeUpdateEventInterval = 2; // emit timeUpdate every 2 seconds
  });

  // When the player first becomes ready, seek to the room's current time and play/pause
  useEffect(() => {
    const sub = player.addListener("statusChange", ({ status }) => {
      if (status !== "readyToDisplay") return;
      syncLockRef.current = true;
      player.currentTime = currentTimeRef.current;
      if (isPlayingRef.current) {
        player.play();
      }
      setTimeout(() => {
        syncLockRef.current = false;
      }, 1000);
    });
    return () => sub.remove();
  }, [player]);

  // Apply remote play / pause / seek from socket events
  useEffect(() => {
    syncLockRef.current = true;
    const drift = Math.abs(player.currentTime - state.currentTime);
    if (drift > 2) {
      player.currentTime = state.currentTime;
    }
    if (state.isPlaying) {
      player.play();
    } else {
      player.pause();
    }
    setTimeout(() => {
      syncLockRef.current = false;
    }, 1000);
  }, [state.isPlaying, state.currentTime]);

  // Emit user-initiated play / pause / seek back to socket, and detect video end
  useEffect(() => {
    const playingSub = player.addListener("playingChange", ({ isPlaying }) => {
      if (syncLockRef.current) return;
      if (isPlaying) {
        playVideo(player.currentTime);
      } else {
        pauseVideo(player.currentTime);
      }
    });

    // Detect manual seeks via a large jump in currentTime vs expected
    const timeSub = player.addListener("timeUpdate", ({ currentTime }) => {
      if (syncLockRef.current) return;
      const drift = Math.abs(currentTime - currentTimeRef.current);
      if (drift > 3) {
        seekVideo(currentTime);
      }
    });

    const statusSub = player.addListener("statusChange", ({ status }) => {
      if (status === "idle" && !syncLockRef.current) {
        // expo-video: when playback finishes status goes to idle
        if (onVideoEndRef.current) {
          onVideoEndRef.current();
        }
      }
    });

    return () => {
      playingSub.remove();
      timeSub.remove();
      statusSub.remove();
    };
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        nativeControls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 220, backgroundColor: "#000" },
  video: { flex: 1 },
});
