import React, { useState, useRef } from "react";
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
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { joinRoom } from "../lib/api";

const CODE_LENGTH = 6;

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function JoinRoomScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const { theme } = useTheme();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleJoin = async (overrideCode?: string) => {
    const code = (overrideCode ?? roomId).trim().toUpperCase();
    if (!code || code.length < CODE_LENGTH) return;
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

  const focusInput = () => inputRef.current?.focus();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Back */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[
          styles.backBtn,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={18} color={theme.textSecondary} />
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
            {/* Icon */}
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: theme.primaryMuted,
                  borderColor: theme.primary + "30",
                },
              ]}
            >
              <Ionicons name="key" size={28} color={theme.primary} />
            </View>

            {/* Headline */}
            <Text style={[styles.headline, { color: theme.text }]}>
              Enter Room Code
            </Text>
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>
              Type the 6-character code to join
            </Text>

            {/* Code slot display + hidden input */}
            <Pressable onPress={focusInput} style={styles.codeContainer}>
              {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                const char = roomId[i] ?? "";
                const isFilled = i < roomId.length;
                const isCursor = i === roomId.length && roomId.length < CODE_LENGTH;

                return (
                  <View
                    key={i}
                    style={[
                      styles.codeCell,
                      {
                        backgroundColor: isFilled
                          ? theme.primaryMuted
                          : theme.surface,
                        borderColor: isCursor
                          ? theme.primary
                          : isFilled
                          ? theme.primary + "55"
                          : theme.border,
                        borderWidth: isCursor ? 2 : 1.5,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.codeCellText,
                        { color: isFilled ? theme.primary : "transparent" },
                      ]}
                    >
                      {char || " "}
                    </Text>
                    {isCursor && (
                      <View
                        style={[
                          styles.cursor,
                          { backgroundColor: theme.primary },
                        ]}
                      />
                    )}
                  </View>
                );
              })}

              {/* Visually hidden input */}
              <TextInput
                ref={inputRef}
                value={roomId}
                onChangeText={(val) => {
                  const upper = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
                  setRoomId(upper);
                  setError(null);
                  if (upper.length === CODE_LENGTH) {
                    setTimeout(() => handleJoin(upper), 50);
                  }
                }}
                autoCapitalize="characters"
                maxLength={CODE_LENGTH}
                returnKeyType="go"
                onSubmitEditing={() => handleJoin()}
                autoFocus
                style={styles.hiddenInput}
                caretHidden
              />
            </Pressable>

            {/* Counter */}
            <Text style={[styles.counter, { color: theme.textSecondary }]}>
              {roomId.length} / {CODE_LENGTH}
            </Text>

            {error && (
              <View
                style={[
                  styles.errorRow,
                  {
                    backgroundColor: theme.danger + "12",
                    borderColor: theme.danger + "30",
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={theme.danger}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  {error}
                </Text>
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
                <ActivityIndicator
                  color={theme.chatBubbleSelfText}
                  size="small"
                />
              ) : (
                <>
                  <Ionicons
                    name="enter-outline"
                    size={19}
                    color={theme.chatBubbleSelfText}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.joinBtnText,
                      { color: theme.chatBubbleSelfText },
                    ]}
                  >
                    Join Room
                  </Text>
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
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
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
    paddingTop: 80,
    alignItems: "center",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginBottom: 8,
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 36,
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  codeCell: {
    width: 44,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  codeCellText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cursor: {
    position: "absolute",
    bottom: 10,
    width: 2,
    height: 22,
    borderRadius: 1,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  counter: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    alignSelf: "stretch",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  joinBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    alignSelf: "stretch",
    shadowColor: "#F5A524",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  joinBtnText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  disabled: { opacity: 0.45 },
});
