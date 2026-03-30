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
        {/* Title & Context */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Enter Room Code
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Type the 6-character code to join your friends
          </Text>
        </View>

        {/* Code Input */}
        <View style={styles.inputSection}>
          <View style={[styles.inputWrap, { borderColor: error ? theme.danger : theme.border, backgroundColor: theme.surface }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={roomId}
              onChangeText={(val) => {
                setRoomId(val.toUpperCase());
                setError(null);
              }}
              placeholder="A1B2C3"
              placeholderTextColor={theme.textSecondary + "40"}
              autoCapitalize="characters"
              maxLength={6}
              textAlign="center"
              returnKeyType="go"
              onSubmitEditing={handleJoin}
            />
          </View>

          {error && (
            <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
          )}

          {/* Join Button — solid */}
          <TouchableOpacity
            onPress={handleJoin}
            disabled={loading || !roomId.trim()}
            style={[
              styles.solidBtn,
              { backgroundColor: theme.primary },
              (loading || !roomId.trim()) && styles.btnDisabled
            ]}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <Text style={[styles.solidBtnText, { color: theme.background }]}>Join Room</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  inputSection: {
    gap: 32,
  },
  inputWrap: {
    borderWidth: 2,
    borderRadius: 24,
  },
  input: {
    height: 100,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 20,
    paddingHorizontal: 32,
  },
  error: { fontSize: 14, textAlign: "center", marginTop: -16, fontWeight: "600" },
  solidBtn: {
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  solidBtnText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  btnDisabled: { opacity: 0.5 },
});

