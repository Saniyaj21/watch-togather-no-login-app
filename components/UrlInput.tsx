import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";
import { getVideoType, toEmbedUrl } from "../lib/videoUtils";

export default function UrlInput() {
  const { theme } = useTheme();
  const { changeVideo } = useRoom();
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const videoType = getVideoType(trimmed);
    // Convert to embed URL so only the video player shows, not the full site
    const embedUrl = videoType === "youtube" ? trimmed : toEmbedUrl(trimmed);
    changeVideo(embedUrl, videoType);
    setUrl("");
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        value={url}
        onChangeText={setUrl}
        placeholder="Paste video URL (YouTube, Vimeo, etc.)"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.btn, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.btnText}>Load</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  btn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#FFF", fontWeight: "600" },
});
