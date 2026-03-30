import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
      <View style={[styles.placeholder, { backgroundColor: "rgba(10, 14, 24, 0.4)" }]}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primary + "1A" }]}>
          <Ionicons name="play" size={32} color={theme.primary} />
        </View>
        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
          No video loaded yet.
        </Text>
        <Text style={[styles.placeholderSubtext, { color: theme.textSecondary + "99" }]}>
          Swipe to the 'Video' tab to paste a URL.
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
    paddingHorizontal: 40,
  },
  placeholderText: { fontSize: 17, fontWeight: "700", textAlign: "center", marginTop: 16 },
  placeholderSubtext: { fontSize: 13, textAlign: "center", marginTop: 4 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(186, 158, 255, 0.2)",
  },
});
