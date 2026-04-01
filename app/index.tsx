import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { createRoom } from "../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";

const { width: W } = Dimensions.get("window");

const AVATARS = [
  { initials: "A", angle: -28, radius: 88, color: "#6366F1" },
  { initials: "M", angle: 0,   radius: 100, color: "#EC4899" },
  { initials: "J", angle: 28,  radius: 88, color: "#F59E0B" },
];

function WatchPartyIllustration() {
  const { theme, isDark } = useTheme();
  const screenW = W - 56;
  const screenH = screenW * 0.56;

  return (
    <View style={[illustration.root, { width: screenW }]}>
      {/* Glow behind screen */}
      <View style={[
        illustration.glow,
        { width: screenW * 0.8, height: screenH * 0.6, backgroundColor: theme.primary + "18" }
      ]} />

      {/* TV / Screen */}
      <View style={[illustration.screenWrap, { width: screenW, height: screenH, borderColor: theme.border }]}>
        <LinearGradient
          colors={isDark ? ["#1E293B", "#0F172A"] : ["#EEF2FF", "#E0E7FF"]}
          style={[illustration.screenInner, { borderRadius: 18 }]}
        >
          {/* Fake progress bar */}
          <View style={illustration.progressTrack}>
            <View style={[illustration.progressFill, { backgroundColor: theme.primary, width: "42%" }]} />
          </View>

          {/* Play button */}
          <View style={[illustration.playRing, { borderColor: theme.primary + "40" }]}>
            <View style={[illustration.playBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="play" size={22} color="#fff" style={{ marginLeft: 3 }} />
            </View>
          </View>

          {/* Sync badge */}
          <View style={[illustration.syncBadge, { backgroundColor: theme.primary, top: 12, right: 12 }]}>
            <Ionicons name="sync" size={10} color="#fff" style={{ marginRight: 3 }} />
            <Text style={illustration.syncText}>LIVE SYNC</Text>
          </View>

          {/* Time label */}
          <View style={[illustration.timeLabel, { backgroundColor: theme.surface + "CC", bottom: 14, left: 14 }]}>
            <Text style={[illustration.timeText, { color: theme.textSecondary }]}>0:42 / 1:54:18</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Avatar row */}
      <View style={illustration.avatarRow}>
        {AVATARS.map((av, i) => (
          <View key={i} style={illustration.avatarItem}>
            {/* Pulse ring */}
            <View style={[illustration.pulse, { borderColor: av.color + "30" }]} />
            <View style={[illustration.avatar, { backgroundColor: av.color + "22", borderColor: av.color + "55" }]}>
              <Text style={[illustration.avatarInitial, { color: av.color }]}>{av.initials}</Text>
            </View>
            {/* Active dot */}
            <View style={[illustration.activeDot, { backgroundColor: "#10B981" }]} />
          </View>
        ))}

        {/* +2 more */}
        <View style={illustration.avatarItem}>
          <View style={[illustration.avatar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[illustration.avatarInitial, { color: theme.textSecondary, fontSize: 11 }]}>+2</Text>
          </View>
        </View>
      </View>

      {/* Floating chat bubble */}
      <View style={[
        illustration.chatBubble,
        { backgroundColor: theme.surface, borderColor: theme.border, top: screenH * 0.08, left: -10 }
      ]}>
        <Text style={{ fontSize: 11, color: theme.textSecondary }}>😂 lol same</Text>
      </View>

      {/* Floating reaction */}
      <View style={[
        illustration.reactionBubble,
        { backgroundColor: theme.surface, borderColor: theme.border, top: screenH * 0.22, right: -8 }
      ]}>
        <Text style={{ fontSize: 14 }}>🍿</Text>
      </View>
    </View>
  );
}

const illustration = StyleSheet.create({
  root: {
    alignItems: "center",
    marginBottom: 36,
  },
  glow: {
    position: "absolute",
    top: "20%",
    borderRadius: 999,
    alignSelf: "center",
  },
  screenWrap: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  screenInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(128,128,128,0.2)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  playRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  syncBadge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  syncText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  timeLabel: {
    position: "absolute",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: { fontSize: 10, fontWeight: "600" },
  avatarRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: "800",
  },
  activeDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  chatBubble: {
    position: "absolute",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  reactionBubble: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
});

// ─── Main Screen ────────────────────────────────────────────────────────────

const NAME_STORAGE_KEY = "wt_user_name";

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(NAME_STORAGE_KEY).then((saved) => {
      if (saved) setName(saved);
    });
  }, []);

  const saveName = (n: string) => AsyncStorage.setItem(NAME_STORAGE_KEY, n);

  const handleCreate = async () => {
    if (!name.trim()) { setError("Enter your name to continue"); return; }
    setError("");
    setCreating(true);
    try {
      await saveName(name.trim());
      const data = await createRoom(name.trim());
      router.replace({ pathname: "/room/[roomId]", params: { roomId: data.roomId, name: name.trim() } });
    } catch {
      setError("Failed to create room. Try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    if (!name.trim()) { setError("Enter your name to continue"); return; }
    setError("");
    saveName(name.trim());
    router.push({ pathname: "/join-room", params: { name: name.trim() } });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Theme toggle */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.themeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        activeOpacity={0.7}
      >
        <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={theme.textSecondary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.body}>
        <WatchPartyIllustration />

        {/* Copy */}
        <Text style={[styles.headline, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>Watch & Chat Together</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
          Sync any video with friends — no sign-up, no personal info collected
        </Text>

        {/* Input */}
        <View style={[
          styles.inputWrap,
          { borderColor: error ? theme.danger : theme.border, backgroundColor: theme.surface }
        ]}>
          <Ionicons name="person-outline" size={16} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={name}
            onChangeText={(val) => { setName(val); if (val.trim()) setError(""); }}
            placeholder="Your name"
            placeholderTextColor={theme.textSecondary + "60"}
            autoCapitalize="words"
            returnKeyType="done"
          />
          {name.length > 0 && (
            <TouchableOpacity
              onPress={() => { setName(""); AsyncStorage.removeItem(NAME_STORAGE_KEY); }}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={creating}
            style={[styles.primaryBtn, { backgroundColor: theme.primary }, creating && styles.disabled]}
            activeOpacity={0.85}
          >
            {creating ? (
              <ActivityIndicator color={theme.background} size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={18} color={theme.background} style={styles.btnIcon} />
                <Text style={[styles.primaryBtnText, { color: theme.background }]}>Create Room</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleJoin} style={styles.secondaryBtn} activeOpacity={0.7}>
            <Ionicons name="enter-outline" size={18} color={theme.primary} style={styles.btnIcon} />
            <Text style={[styles.secondaryBtnText, { color: theme.primary }]}>Join with a code</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <Text style={[styles.footer, { color: theme.textSecondary }]}>No account · No personal data saved</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  themeBtn: {
    position: "absolute",
    top: 56,
    right: 24,
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  headline: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 8,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    marginBottom: 8,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnIcon: { marginRight: 8 },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  disabled: { opacity: 0.6 },
  footer: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    paddingBottom: 20,
    letterSpacing: 0.3,
  },
});
