import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { joinRoom } from "../lib/api";

export default function JoinRoomScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const { theme } = useTheme();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const code = roomId.trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setError(null);
    try {
      await joinRoom(code, name || "Guest");
      router.replace({
        pathname: "/room/[roomId]",
        params: { roomId: code, name: name || "Guest" },
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Enter Room Code
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: error ? theme.danger : theme.border,
            },
          ]}
          value={roomId}
          onChangeText={(val) => {
            setRoomId(val.toUpperCase());
            setError(null);
          }}
          placeholder="e.g. A1B2C3"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="characters"
          maxLength={6}
          textAlign="center"
          returnKeyType="go"
          onSubmitEditing={handleJoin}
        />

        {error && (
          <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
        )}

        <TouchableOpacity
          onPress={handleJoin}
          style={[styles.btn, { backgroundColor: theme.primary }]}
          disabled={loading || !roomId.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnText}>Join Room</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  content: { paddingHorizontal: 32, gap: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    height: 60,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 8,
  },
  error: { fontSize: 14, textAlign: "center" },
  btn: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#FFF", fontSize: 17, fontWeight: "700" },
});
