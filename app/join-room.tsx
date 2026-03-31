import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { joinRoom } from "../lib/api";

const { width: W } = Dimensions.get("window");
const CODE_LENGTH = 6; // used for auto-join trigger and counter

// ─── Illustration ────────────────────────────────────────────────────────────

function JoinIllustration() {
  const { theme, isDark } = useTheme();

  return (
    <View style={illus.root}>
      {/* Glow */}
      <View style={[illus.glow, { backgroundColor: theme.primary + "18" }]} />

      {/* Door / Portal shape */}
      <LinearGradient
        colors={isDark ? ["#1E293B", "#0F172A"] : ["#EEF2FF", "#E0E7FF"]}
        style={[illus.portal, { borderColor: theme.border }]}
      >
        {/* Key icon */}
        <View style={[illus.keyRing, { borderColor: theme.primary + "40" }]}>
          <View style={[illus.keyCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="key" size={24} color="#fff" />
          </View>
        </View>

        {/* Fake code preview */}
        <View style={illus.codeRow}>
          {["A", "1", "B", "·", "·", "·"].map((ch, i) => (
            <View
              key={i}
              style={[
                illus.codeCell,
                {
                  backgroundColor: i < 3 ? theme.primary + "20" : theme.border + "40",
                  borderColor: i < 3 ? theme.primary + "50" : theme.border,
                },
              ]}
            >
              <Text style={[illus.codeCellText, { color: i < 3 ? theme.primary : theme.textSecondary + "60" }]}>
                {ch}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Floating "invited" badge */}
      <View style={[illus.badge, { backgroundColor: theme.success + "22", borderColor: theme.success + "44", left: -12, top: 20 }]}>
        <Ionicons name="checkmark-circle" size={12} color={theme.success} style={{ marginRight: 4 }} />
        <Text style={[illus.badgeText, { color: theme.success }]}>Invited</Text>
      </View>

      {/* Floating people badge */}
      <View style={[illus.badge, { backgroundColor: theme.primary + "18", borderColor: theme.primary + "33", right: -8, bottom: 28 }]}>
        <Ionicons name="people" size={12} color={theme.primary} style={{ marginRight: 4 }} />
        <Text style={[illus.badgeText, { color: theme.primary }]}>3 watching</Text>
      </View>
    </View>
  );
}

const illus = StyleSheet.create({
  root: {
    alignItems: "center",
    marginBottom: 36,
    height: 190,
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 180,
    height: 100,
    borderRadius: 999,
    alignSelf: "center",
    top: "30%",
  },
  portal: {
    width: W - 80,
    height: 160,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  keyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  keyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  codeRow: {
    flexDirection: "row",
    gap: 6,
  },
  codeCell: {
    width: 28,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  codeCellText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  badge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function JoinRoomScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const { theme } = useTheme();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async (overrideCode?: string) => {
    const code = (overrideCode ?? roomId).trim().toUpperCase();
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
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Back */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={18} color={theme.textSecondary} />
      </TouchableOpacity>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.body}>
            <JoinIllustration />

            {/* Headline */}
            <Text style={[styles.headline, { color: theme.text }]}>Enter Room Code</Text>
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>
              Got a 6-character code? Paste it below to jump in.
            </Text>

            {/* Code input */}
            <View style={[
              styles.inputWrap,
              { borderColor: error ? theme.danger : theme.border, backgroundColor: theme.surface },
            ]}>
              <Ionicons name="key-outline" size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={roomId}
                onChangeText={(val) => {
                  const upper = val.toUpperCase();
                  setRoomId(upper);
                  setError(null);
                  if (upper.length === CODE_LENGTH) {
                    setTimeout(() => handleJoin(upper), 0);
                  }
                }}
                placeholder="A1B2C3"
                placeholderTextColor={theme.textSecondary + "60"}
                autoCapitalize="characters"
                maxLength={CODE_LENGTH}
                returnKeyType="go"
                onSubmitEditing={() => handleJoin()}
                autoFocus
              />
              {roomId.length > 0 && (
                <Text style={[styles.counter, { color: theme.textSecondary }]}>{roomId.length}/{CODE_LENGTH}</Text>
              )}
            </View>

            {error && (
              <View style={[styles.errorRow, { backgroundColor: theme.danger + "12", borderColor: theme.danger + "30" }]}>
                <Ionicons name="alert-circle-outline" size={14} color={theme.danger} style={{ marginRight: 6 }} />
                <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
              </View>
            )}

            {/* Join button */}
            <TouchableOpacity
              onPress={() => handleJoin()}
              disabled={loading || roomId.length < CODE_LENGTH}
              style={[
                styles.joinBtn,
                { backgroundColor: theme.primary },
                (loading || roomId.length < CODE_LENGTH) && styles.disabled,
              ]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={theme.background} size="small" />
              ) : (
                <>
                  <Ionicons name="enter-outline" size={18} color={theme.background} style={{ marginRight: 8 }} />
                  <Text style={[styles.joinBtnText, { color: theme.background }]}>Join Room</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: {
    position: "absolute",
    top: 56,
    left: 24,
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
    paddingTop: 72,
  },
  headline: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 32,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 4,
  },
  counter: {
    fontSize: 12,
    fontWeight: "600",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  joinBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  joinBtnText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  disabled: { opacity: 0.5 },
});
