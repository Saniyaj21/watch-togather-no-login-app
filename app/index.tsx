import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { createRoom } from "../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Please enter your name first");
      return;
    }
    setError("");
    setCreating(true);
    try {
      const data = await createRoom(name.trim());
      router.replace({ pathname: "/room/[roomId]", params: { roomId: data.roomId, name: name.trim() } });
    } catch (err) {
      setError("Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    if (!name.trim()) {
      setError("Please enter your name first");
      return;
    }
    setError("");
    router.push({ pathname: "/join-room", params: { name: name.trim() } });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Watch Together
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary + "CC" }]}>
            Watch videos in sync with friends
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Glassmorphic Input */}
          <View style={[styles.inputWrap, { borderColor: theme.border + "1A" }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (val.trim()) setError("");
              }}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary + "80"}
              autoCapitalize="words"
            />
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: theme.danger }]}>
              {error}
            </Text>
          ) : null}

          {/* Create Room — gradient button */}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!name.trim() || creating}
            style={[(!name.trim() || creating) && styles.btnDisabled]}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#ba9eff", "#8455ef"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.gradientBtnText}>
                {creating ? "Creating..." : "Create Room"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Join Room — outline button */}
          <TouchableOpacity
            onPress={handleJoin}
            style={[
              styles.outlineBtn,
              { borderColor: theme.border + "4D" },
              !name.trim() && styles.btnDisabled,
            ]}
            disabled={!name.trim()}
            activeOpacity={0.85}
          >
            <Text style={[styles.outlineBtnText, { color: theme.primary }]}>
              Join Room
            </Text>
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
    marginBottom: 64,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: -0.3,
  },
  form: { gap: 16 },
  inputWrap: {
    backgroundColor: "rgba(32, 37, 52, 0.3)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 32,
  },
  input: {
    height: 60,
    fontSize: 18,
  },
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
  outlineBtn: {
    height: 60,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  outlineBtnText: {
    fontSize: 18,
    fontWeight: "700",
  },
  btnDisabled: { opacity: 0.5 },
  errorText: { fontSize: 13, textAlign: "center" },
});

