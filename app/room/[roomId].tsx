import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { RoomProvider, useRoom } from "../../contexts/RoomContext";
import RoomHeader from "../../components/RoomHeader";
import VideoPlayer from "../../components/VideoPlayer";
import UrlInput from "../../components/UrlInput";
import ChatPanel from "../../components/ChatPanel";
import ParticipantList from "../../components/ParticipantList";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function RoomContent() {
  const { roomId, name } = useLocalSearchParams<{
    roomId: string;
    name: string;
  }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { state } = useRoom();

  const [activeTab, setActiveTab] = useState<number>(1);
  const scrollRef = useRef<ScrollView>(null);

  // ── Unread badge ──────────────────────────────────────────────────────────
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const unreadCount = activeTab !== 1 ? Math.max(0, state.messages.length - lastSeenCount) : 0;

  useEffect(() => {
    if (activeTab === 1) {
      setLastSeenCount(state.messages.length);
    }
  }, [activeTab, state.messages.length]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ senderName: string; text: string } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMsgLen = useRef(-1);

  const dismissToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setToast(null));
  };

  const showToast = (senderName: string, text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ senderName, text });
    toastAnim.setValue(0);
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    toastTimer.current = setTimeout(dismissToast, 3000);
  };

  useEffect(() => {
    const newLen = state.messages.length;

    // Skip the initial history load — don't toast for old messages
    if (prevMsgLen.current === -1) {
      prevMsgLen.current = newLen;
      return;
    }

    if (newLen > prevMsgLen.current) {
      const newMsg = state.messages[newLen - 1];
      if (activeTab !== 1 && newMsg && !newMsg.isSystem) {
        showToast(newMsg.senderName, newMsg.text);
      }
      prevMsgLen.current = newLen;
    }
  }, [state.messages.length]);

  const handleToastPress = () => {
    dismissToast();
    handleTabPress(1);
  };

  // ── Kick ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.kicked) {
      Alert.alert(
        "Removed from Room",
        "You were removed by the host.",
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    }
  }, [state.kicked]);

  const handleLeave = () => {
    router.replace("/");
  };

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (activeTab !== index) {
      setActiveTab(index);
    }
  };

  const renderTab = (index: number, icon: any, label: string | number) => {
    const isActive = activeTab === index;
    const showBadge = index === 1 && unreadCount > 0;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleTabPress(index)}
        style={styles.tab}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          <View>
            <Ionicons
              name={icon}
              size={15}
              color={isActive ? theme.primary : theme.textSecondary}
              style={{ marginRight: showBadge ? 2 : 5 }}
            />
            {showBadge && (
              <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, { color: isActive ? theme.primary : theme.textSecondary }]}>
            {label}
          </Text>
        </View>
        <View style={[styles.tabUnderline, isActive && { backgroundColor: theme.primary }]} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <RoomHeader roomId={roomId || ""} myName={name || "Guest"} onLeave={handleLeave} />

      <VideoPlayer />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        enabled={Platform.OS === "ios"}
        keyboardVerticalOffset={0}
      >
        {/* Tab Navigation */}
        <View style={[styles.tabBarContainer, { borderBottomColor: theme.border }]}>
          <View style={styles.tabTrack}>
            {renderTab(0, "play", "Video")}
            {renderTab(1, "chatbubble", "Chat")}
            {renderTab(2, "people", state.participants?.length || 0)}
          </View>
        </View>

        <View style={styles.contentArea}>
          {/* Toast */}
          {toast && (
            <Animated.View
              style={[
                styles.toast,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: toastAnim,
                  transform: [
                    {
                      translateY: toastAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-16, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                onPress={handleToastPress}
                style={styles.toastInner}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubble" size={13} color={theme.primary} style={{ marginTop: 1 }} />
                <View style={styles.toastTextBlock}>
                  <Text style={[styles.toastName, { color: theme.primary }]} numberOfLines={1}>
                    {toast.senderName}
                  </Text>
                  <Text style={[styles.toastMsg, { color: theme.text }]} numberOfLines={1}>
                    {toast.text}
                  </Text>
                </View>
                <TouchableOpacity onPress={dismissToast} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <Ionicons name="close" size={14} color={theme.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          )}

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            contentOffset={{ x: SCREEN_WIDTH, y: 0 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Tab 0: Load Video */}
            <View style={{ width: SCREEN_WIDTH }}>
              <View style={styles.videoTabContainer}>
                <View style={styles.urlInputWrapper}>
                  <UrlInput />
                </View>
                <Text style={[styles.videoTabHeadline, { color: theme.textSecondary }]}>
                  Want to watch something else?
                </Text>
                <Text style={[styles.videoTabSubline, { color: theme.textSecondary + "99" }]}>
                  Paste a new video URL above to sync it to the room.
                </Text>
              </View>
            </View>

            {/* Tab 1: Chat */}
            <View style={{ width: SCREEN_WIDTH }}>
              <ChatPanel myName={name || "Guest"} />
            </View>

            {/* Tab 2: Participants */}
            <View style={{ width: SCREEN_WIDTH }}>
              <ParticipantList myName={name || "Guest"} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function RoomScreen() {
  const { roomId, name } = useLocalSearchParams<{
    roomId: string;
    name: string;
  }>();

  return (
    <RoomProvider roomId={roomId || ""} name={name || "Guest"}>
      <RoomContent />
    </RoomProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentArea: { flex: 1 },
  tabBarContainer: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tabTrack: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: "15%",
    right: "15%",
    height: 2,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  tabLabel: { fontSize: 13, fontWeight: "700" },
  // Badge
  badge: {
    position: "absolute",
    top: -5,
    right: -6,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  // Toast
  toast: {
    position: "absolute",
    top: 8,
    left: 12,
    right: 12,
    zIndex: 999,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  toastInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  toastTextBlock: {
    flex: 1,
  },
  toastName: {
    fontSize: 12,
    fontWeight: "700",
  },
  toastMsg: {
    fontSize: 13,
    fontWeight: "400",
  },
  // Video tab
  videoTabContainer: {
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  videoTabHeadline: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  videoTabSubline: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  urlInputWrapper: {
    width: "100%",
  },
});
