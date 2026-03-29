import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { createRoom } from "../lib/api";

function normalizeNameParam(
  raw: string | string[] | undefined
): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (Array.isArray(raw) && raw[0] && String(raw[0]).trim())
    return String(raw[0]).trim();
  return "Host";
}

export default function CreateRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string | string[] }>();
  const displayName = normalizeNameParam(params.name);
  const { theme } = useTheme();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createRoom(displayName)
      .then((data) => {
        setRoomId(data.roomId);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? "Failed to create room");
        setLoading(false);
      });
  }, [displayName]);

  const copyAndEnter = async () => {
    if (!roomId) return;
    // Load clipboard native module only when needed (avoids crashes on some dev builds at screen load)
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(roomId);
    router.replace({
      pathname: "/room/[roomId]",
      params: { roomId, name: displayName },
    });
  };

  const enterRoom = () => {
    if (!roomId) return;
    router.replace({
      pathname: "/room/[roomId]",
      params: { roomId, name: displayName },
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Creating room...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.errorText, { color: theme.danger }]}>
          {error}
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.link, { color: theme.primary }]}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Your Room Code
        </Text>
        <Text style={[styles.code, { color: theme.primary }]}>{roomId}</Text>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Share this code with friends so they can join
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={copyAndEnter}
            style={[styles.btn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.btnText}>Copy Code & Enter Room</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={enterRoom}
            style={[
              styles.btn,
              styles.btnOutline,
              { borderColor: theme.primary },
            ]}
          >
            <Text style={[styles.btnOutlineText, { color: theme.primary }]}>
              Enter Room
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { alignItems: "center", paddingHorizontal: 32 },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorText: { fontSize: 16, marginBottom: 12 },
  link: { fontSize: 16, fontWeight: "600" },
  label: { fontSize: 16, marginBottom: 8 },
  code: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: 6,
    marginBottom: 12,
  },
  hint: { fontSize: 14, textAlign: "center", marginBottom: 32 },
  buttons: { gap: 12, width: "100%" },
  btn: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 260,
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  btnOutline: { backgroundColor: "transparent", borderWidth: 2 },
  btnOutlineText: { fontSize: 16, fontWeight: "700" },
});
