import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";
import { getVideoType, toEmbedUrl } from "../lib/videoUtils";

export default function UrlInput() {
  const { theme } = useTheme();
  const { changeVideo } = useRoom();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Validate it's a real URL
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setError("URL must start with http:// or https://");
        return;
      }
    } catch {
      setError("That doesn't look like a valid URL");
      return;
    }

    setError(null);
    const videoType = getVideoType(trimmed);
    const embedUrl = videoType === "youtube" || videoType === "direct" ? trimmed : toEmbedUrl(trimmed);
    changeVideo(embedUrl, videoType);
    setUrl("");

    // Brief success state on button
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  const handleChange = (val: string) => {
    setUrl(val);
    if (error) setError(null);
  };

  return (
    <View style={styles.outer}>
      <View style={[styles.pill, { backgroundColor: theme.surface, borderColor: error ? theme.danger : theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={url}
          onChangeText={handleChange}
          placeholder="Enter video URL..."
          placeholderTextColor={theme.textSecondary + "80"}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.btn, { backgroundColor: success ? theme.success : theme.primary }]}
          activeOpacity={0.8}
        >
          {success ? (
            <Ionicons name="checkmark" size={18} color={theme.background} />
          ) : (
            <Text style={[styles.btnText, { color: theme.background }]}>Load</Text>
          )}
        </TouchableOpacity>
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: "100%",
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
    minWidth: 60,
  },
  btnText: {
    fontWeight: "700",
    fontSize: 13,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 14,
    fontWeight: "500",
  },
});
