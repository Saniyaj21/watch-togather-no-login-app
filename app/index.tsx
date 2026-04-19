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
import { useTheme } from "../contexts/ThemeContext";

const { width: W } = Dimensions.get("window");
const NAME_STORAGE_KEY = "wt_user_name";

const MEMBER_COLORS = ["#6366F1", "#EC4899", "#10B981"];

function CinemaHero() {
  const { theme, isDark } = useTheme();
  const sw = W - 56;
  const sh = sw * 0.54;

  return (
    <View style={[hero.root, { width: sw }]}>
      {/* Ambient glow behind screen */}
      <View
        style={[
          hero.glow,
          {
            width: sw * 0.65,
            height: sh * 0.75,
            backgroundColor: theme.primary + "1A",
          },
        ]}
      />

      {/* Cinema screen */}
      <View
        style={[
          hero.screen,
          {
            width: sw,
            height: sh,
            backgroundColor: theme.surface2,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Progress bar */}
        <View style={[hero.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[hero.progressFill, { backgroundColor: theme.primary, width: "38%" }]}
          />
          <View
            style={[hero.progressThumb, { backgroundColor: theme.primary }]}
          />
        </View>

        {/* Play button */}
        <View style={[hero.playRing, { borderColor: theme.primary + "35" }]}>
          <View style={[hero.playBtn, { backgroundColor: theme.primary }]}>
            <Ionicons
              name="play"
              size={22}
              color={theme.chatBubbleSelfText}
              style={{ marginLeft: 3 }}
            />
          </View>
        </View>

        {/* LIVE badge */}
        <View style={[hero.liveBadge, { backgroundColor: theme.primary }]}>
          <View
            style={[hero.liveDot, { backgroundColor: theme.chatBubbleSelfText }]}
          />
          <Text style={[hero.liveText, { color: theme.chatBubbleSelfText }]}>
            LIVE
          </Text>
        </View>

        {/* Time */}
        <View
          style={[
            hero.timeTag,
            {
              backgroundColor: isDark
                ? "rgba(0,0,0,0.55)"
                : "rgba(255,255,255,0.8)",
            },
          ]}
        >
          <Text style={[hero.timeText, { color: theme.textSecondary }]}>
            1:38 / 2:04:18
          </Text>
        </View>

        {/* Floating chat bubble */}
        <View
          style={[
            hero.chatBubble,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={{ fontSize: 10, color: theme.textSecondary }}>
            😂 lol same
          </Text>
        </View>
      </View>

      {/* Member avatars */}
      <View style={hero.memberRow}>
        {[
          { l: "A", c: MEMBER_COLORS[0] },
          { l: "M", c: MEMBER_COLORS[1] },
          { l: "J", c: MEMBER_COLORS[2] },
        ].map(({ l, c }, i) => (
          <View key={i} style={hero.avatarWrap}>
            <View
              style={[
                hero.avatar,
                { backgroundColor: c + "22", borderColor: c + "55" },
              ]}
            >
              <Text style={[hero.avatarLetter, { color: c }]}>{l}</Text>
            </View>
            <View
              style={[
                hero.onlineDot,
                {
                  backgroundColor: theme.success,
                  borderColor: theme.background,
                },
              ]}
            />
          </View>
        ))}
        <View style={hero.avatarWrap}>
          <View
            style={[
              hero.avatar,
              {
                backgroundColor: theme.surface2,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[hero.avatarLetter, { color: theme.textSecondary, fontSize: 10 }]}>
              +4
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const hero = StyleSheet.create({
  root: {
    alignItems: "center",
    marginBottom: 40,
  },
  glow: {
    position: "absolute",
    top: "15%",
    borderRadius: 999,
    alignSelf: "center",
  },
  screen: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F5A524",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  progressFill: {
    height: "100%",
  },
  progressThumb: {
    position: "absolute",
    left: "38%",
    top: -3,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginLeft: -4.5,
  },
  playRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F5A524",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  liveBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  liveText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  timeTag: {
    position: "absolute",
    bottom: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeText: { fontSize: 10, fontWeight: "600" },
  chatBubble: {
    position: "absolute",
    bottom: 22,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  memberRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
    alignItems: "center",
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: "800",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
});

// ─── Main Screen ────────────────────────────────────────────────────────────

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
    if (!name.trim()) {
      setError("Enter your name to continue");
      return;
    }
    setError("");
    setCreating(true);
    try {
      await saveName(name.trim());
      const data = await createRoom(name.trim());
      router.replace({
        pathname: "/room/[roomId]",
        params: { roomId: data.roomId, name: name.trim() },
      });
    } catch {
      setError("Failed to create room. Try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    if (!name.trim()) {
      setError("Enter your name to continue");
      return;
    }
    setError("");
    saveName(name.trim());
    router.push({ pathname: "/join-room", params: { name: name.trim() } });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Theme toggle */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[
          styles.themeBtn,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isDark ? "sunny-outline" : "moon-outline"}
          size={17}
          color={theme.textSecondary}
        />
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
            <CinemaHero />

            {/* Wordmark */}
            <View style={styles.titleRow}>
              <View style={[styles.titleDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.headline, { color: theme.text }]}>
                Watch Together
              </Text>
            </View>
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>
              Sync any video with friends — no account needed
            </Text>

            {/* Name input */}
            <View
              style={[
                styles.inputWrap,
                {
                  borderColor: error ? theme.danger : theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            >
              <View
                style={[
                  styles.inputAvatar,
                  { backgroundColor: theme.primary + "22", borderColor: theme.primary + "44" },
                ]}
              >
                {name.trim() ? (
                  <Text style={[styles.inputAvatarText, { color: theme.primary }]}>
                    {name.trim().charAt(0).toUpperCase()}
                  </Text>
                ) : (
                  <Ionicons
                    name="person-outline"
                    size={14}
                    color={theme.primary}
                  />
                )}
              </View>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (val.trim()) setError("");
                }}
                placeholder="Your display name"
                placeholderTextColor={theme.textSecondary + "70"}
                autoCapitalize="words"
                returnKeyType="done"
              />
              {name.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setName("");
                    AsyncStorage.removeItem(NAME_STORAGE_KEY);
                  }}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={17}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {error ? (
              <View style={styles.errorRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={13}
                  color={theme.danger}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.error, { color: theme.danger }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={creating}
                style={[
                  styles.primaryBtn,
                  { backgroundColor: theme.primary },
                  creating && styles.disabled,
                ]}
                activeOpacity={0.85}
              >
                {creating ? (
                  <ActivityIndicator
                    color={theme.chatBubbleSelfText}
                    size="small"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="add-circle-outline"
                      size={19}
                      color={theme.chatBubbleSelfText}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.primaryBtnText,
                        { color: theme.chatBubbleSelfText },
                      ]}
                    >
                      Create Room
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleJoin}
                style={[
                  styles.secondaryBtn,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                ]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="enter-outline"
                  size={19}
                  color={theme.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[styles.secondaryBtnText, { color: theme.primary }]}
                >
                  Join with a code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Text style={[styles.footer, { color: theme.textSecondary + "80" }]}>
        No account · No personal data saved
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  themeBtn: {
    position: "absolute",
    top: 56,
    right: 20,
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
    paddingVertical: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  titleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headline: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 28,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 54,
    marginBottom: 8,
    gap: 10,
  },
  inputAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inputAvatarText: {
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 2,
  },
  error: {
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F5A524",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  disabled: { opacity: 0.55 },
  footer: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    paddingBottom: 18,
    letterSpacing: 0.2,
  },
});
