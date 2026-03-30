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
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Watch videos in sync with friends
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Minimal Solid Input */}
          <View style={[styles.inputWrap, { borderColor: theme.border, backgroundColor: theme.surface }]}>
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

          {/* Create Room — solid button */}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!name.trim() || creating}
            style={[
              styles.solidBtn,
              { backgroundColor: theme.primary },
              (!name.trim() || creating) && styles.btnDisabled
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.solidBtnText, { color: theme.background }]}>
              {creating ? "Creating..." : "Create Room"}
            </Text>
          </TouchableOpacity>

          {/* Join Room — outline button */}
          <TouchableOpacity
            onPress={handleJoin}
            style={[
              styles.outlineBtn,
              { borderColor: theme.border },
              !name.trim() && styles.btnDisabled,
            ]}
            disabled={!name.trim()}
            activeOpacity={0.8}
          >
            <Text style={[styles.outlineBtnText, { color: theme.text }]}>
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
    paddingTop: 80,
  },
  header: {
    alignItems: "center",
    marginBottom: 64,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  form: { gap: 16 },
  inputWrap: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
  },
  input: {
    height: 56,
    fontSize: 16,
    fontWeight: "600",
  },
  solidBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  solidBtnText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  outlineBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  outlineBtnText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  btnDisabled: { opacity: 0.5 },
  errorText: { fontSize: 13, textAlign: "center", fontWeight: "600" },
});

