import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    router.push({ pathname: "/create-room", params: { name: name.trim() } });
  };

  const handleJoin = () => {
    if (!name.trim()) return;
    router.push({ pathname: "/join-room", params: { name: name.trim() } });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Text style={{ fontSize: 22 }}>{isDark ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.primary }]}>
          Watch Together
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Watch videos in sync with friends
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="words"
          />

          <TouchableOpacity
            onPress={handleCreate}
            style={[styles.btn, { backgroundColor: theme.primary }]}
            disabled={!name.trim()}
          >
            <Text style={styles.btnText}>Create Room</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleJoin}
            style={[
              styles.btn,
              styles.btnOutline,
              { borderColor: theme.primary },
            ]}
            disabled={!name.trim()}
          >
            <Text style={[styles.btnOutlineText, { color: theme.primary }]}>
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
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  themeToggle: {
    position: "absolute",
    top: 16,
    right: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 48,
  },
  form: { gap: 16 },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  btn: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  btnOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  btnOutlineText: { fontSize: 17, fontWeight: "700" },
});
