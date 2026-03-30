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
    const embedUrl = videoType === "youtube" ? trimmed : toEmbedUrl(trimmed);
    changeVideo(embedUrl, videoType);
    setUrl("");
  };

  return (
    <View style={[styles.outer, { backgroundColor: theme.inputBackground }]}>
      <View style={[styles.pill, { backgroundColor: "#000000", borderColor: theme.border + "80" }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={url}
          onChangeText={setUrl}
          placeholder="Enter video URL..."
          placeholderTextColor={theme.textSecondary + "80"}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity onPress={handleSubmit} style={[styles.btn, { backgroundColor: theme.primary }]}>
          <Text style={[styles.btnText, { color: "#39008c" }]}>Load</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontSize: 13,
    height: 36,
  },
  btn: {
    paddingHorizontal: 20,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontWeight: "700",
    fontSize: 13,
  },
});
