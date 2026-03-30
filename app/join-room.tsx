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
import { LinearGradient } from "expo-linear-gradient";

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
          <View style={[styles.inputWrap, { borderColor: error ? theme.danger + "66" : theme.border + "26" }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={roomId}
              onChangeText={(val) => {
                setRoomId(val.toUpperCase());
                setError(null);
              }}
              placeholder="A1B2C3"
              placeholderTextColor={theme.textSecondary + "33"}
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

          {/* Join Button — gradient */}
          <TouchableOpacity
            onPress={handleJoin}
            disabled={loading || !roomId.trim()}
            style={[(loading || !roomId.trim()) && styles.btnDisabled]}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#ba9eff", "#8455ef"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBtn}
            >
              {loading ? (
                <ActivityIndicator color="#39008c" />
              ) : (
                <Text style={styles.gradientBtnText}>Join Room</Text>
              )}
            </LinearGradient>
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
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
    gap: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  inputSection: {
    gap: 32,
  },
  inputWrap: {
    backgroundColor: "rgba(32, 37, 52, 0.3)",
    borderWidth: 2,
    borderRadius: 16,
  },
  input: {
    height: 80,
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 16,
    paddingHorizontal: 32,
  },
  error: { fontSize: 14, textAlign: "center", marginTop: -16 },
  gradientBtn: {
    height: 60,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientBtnText: {
    color: "#39008c",
    fontSize: 18,
    fontWeight: "700",
  },
  btnDisabled: { opacity: 0.5 },
});

