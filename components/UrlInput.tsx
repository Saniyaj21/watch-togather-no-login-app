import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";
import { getVideoType, toEmbedUrl } from "../lib/videoUtils";

const EXAMPLE_URLS = [
  {
    label: "YouTube",
    url: "https://youtu.be/_Sl8diqCAFw?si=aFL81herkXu5II9j",
    icon: "logo-youtube",
    hint: "Video Share URL",
  },
  {
    label: "MP4",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    icon: "film-outline",
    hint: "Any direct video URL ending in .mp4",
  },
];

export default function UrlInput() {
  const { theme } = useTheme();
  const { state, changeVideo, addToQueue } = useRoom();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [queueSuccess, setQueueSuccess] = useState(false);

  const hasVideo = !!state.videoUrl;
  const [infoExpanded, setInfoExpanded] = useState(!hasVideo);

  const parseUrl = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setError("URL must start with http:// or https://");
        return null;
      }
    } catch {
      setError("That doesn't look like a valid URL");
      return null;
    }
    setError(null);
    const videoType = getVideoType(trimmed);
    const embedUrl = videoType === "youtube" || videoType === "direct" ? trimmed : toEmbedUrl(trimmed);
    return { embedUrl, videoType };
  };

  const handleLoad = () => {
    const result = parseUrl(url);
    if (!result) return;
    changeVideo(result.embedUrl, result.videoType);
    setUrl("");
    setLoadSuccess(true);
    setTimeout(() => setLoadSuccess(false), 1500);
  };

  const handleQueue = () => {
    const result = parseUrl(url);
    if (!result) return;
    addToQueue(result.embedUrl, result.videoType);
    setUrl("");
    setQueueSuccess(true);
    setTimeout(() => setQueueSuccess(false), 1500);
  };

  const handleChange = (val: string) => {
    setUrl(val);
    if (error) setError(null);
  };

  const handleExample = (exUrl: string) => {
    setUrl(exUrl);
    setError(null);
  };

  return (
    <View style={styles.outer}>
      {/* URL input pill */}
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
          onSubmitEditing={handleLoad}
        />
        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={handleQueue}
            style={[styles.btn, styles.btnQueue, { backgroundColor: queueSuccess ? theme.success : theme.surface, borderColor: theme.border }]}
            activeOpacity={0.8}
          >
            {queueSuccess ? (
              <Ionicons name="checkmark" size={15} color={theme.primary} />
            ) : (
              <Ionicons name="add-circle-outline" size={15} color={theme.primary} />
            )}
            <Text style={[styles.btnText, { color: theme.primary }]}>Queue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLoad}
            style={[styles.btn, { backgroundColor: loadSuccess ? theme.success : theme.primary }]}
            activeOpacity={0.8}
          >
            {loadSuccess ? (
              <Ionicons name="checkmark" size={15} color={theme.background} />
            ) : (
              <Text style={[styles.btnText, { color: theme.background }]}>Play</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      )}

      {/* Supported formats — collapsible */}
      <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => setInfoExpanded((v) => !v)}
          style={styles.infoHeader}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.infoTitle, { color: theme.textSecondary }]}>Supported formats</Text>
          <Ionicons
            name={infoExpanded ? "chevron-up" : "chevron-down"}
            size={13}
            color={theme.textSecondary}
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {infoExpanded && (
          <View style={styles.infoBody}>
            {EXAMPLE_URLS.map((ex) => (
              <View key={ex.label} style={styles.formatRow}>
                <View style={styles.formatLeft}>
                  <Ionicons name={ex.icon as any} size={13} color={theme.primary} />
                  <View style={styles.formatText}>
                    <Text style={[styles.formatLabel, { color: theme.text }]}>{ex.label}</Text>
                    <Text style={[styles.formatHint, { color: theme.textSecondary }]}>{ex.hint}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleExample(ex.url)}
                  style={[styles.tryBtn, { borderColor: theme.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tryBtnText, { color: theme.primary }]}>Try</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
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
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 13,
    height: 36,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 999,
    justifyContent: "center",
  },
  btnQueue: {
    borderWidth: 1,
  },
  btnText: {
    fontWeight: "700",
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 14,
    fontWeight: "500",
  },
  // Onboarding info card
  infoCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoBody: {
    gap: 10,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  formatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  formatLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  formatText: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  formatHint: {
    fontSize: 11,
    marginTop: 1,
  },
  tryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 8,
  },
  tryBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
