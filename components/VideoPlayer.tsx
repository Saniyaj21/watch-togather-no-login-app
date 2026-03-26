import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoom } from "../contexts/RoomContext";
import { useTheme } from "../contexts/ThemeContext";
import { isYouTubeUrl } from "../lib/videoUtils";
import YouTubePlayer from "./YouTubePlayer";
import IframePlayer from "./IframePlayer";

export default function VideoPlayer() {
  const { state } = useRoom();
  const { theme } = useTheme();

  if (!state.videoUrl) {
    return (
      <View style={[styles.placeholder, { backgroundColor: theme.surface }]}>
        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
          Paste a video URL below to start watching
        </Text>
      </View>
    );
  }

  if (isYouTubeUrl(state.videoUrl)) {
    return <YouTubePlayer url={state.videoUrl} />;
  }

  return <IframePlayer url={state.videoUrl} />;
}

const styles = StyleSheet.create({
  placeholder: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  placeholderText: { fontSize: 15, textAlign: "center" },
});
