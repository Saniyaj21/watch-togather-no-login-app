import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Toast } from "../../components/Toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { RoomProvider, useRoom } from "../../contexts/RoomContext";
import * as Clipboard from "expo-clipboard";
import VideoPlayer from "../../components/VideoPlayer";
import UrlInput from "../../components/UrlInput";
import ChatPanel from "../../components/ChatPanel";
import ParticipantList from "../../components/ParticipantList";
import QueuePanel from "../../components/QueuePanel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function RoomContent() {
  const { roomId, name } = useLocalSearchParams<{
    roomId: string;
    name: string;
  }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { state, advanceQueue } = useRoom();

  const [activeTab, setActiveTab] = useState<number>(1);
  const [videoCollapsed, setVideoCollapsed] = useState(false);
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
      Toast.show({
        type: "error",
        text1: "Removed from Room",
        text2: "You were removed by the host.",
        onHide: () => router.replace("/"),
      });
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

  // ── Queue advance when video ends ─────────────────────────────────────────
  const handleVideoEnd = useCallback(() => {
    // Only advance if there's a queue active
    if (state.queue.length > 0 && state.currentQueueIndex >= 0) {
      advanceQueue();
    }
  }, [state.queue.length, state.currentQueueIndex, advanceQueue]);

  const renderTab = (index: number, icon: any, label: string | number) => {
    const isActive = activeTab === index;
    const showBadge = index === 1 && unreadCount > 0;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleTabPress(index)}
        style={[
          styles.tab,
          isActive && { backgroundColor: theme.primaryMuted },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          <View>
            <Ionicons
              name={icon}
              size={14}
              color={isActive ? theme.primary : theme.textSecondary}
              style={{ marginRight: showBadge ? 2 : 4 }}
            />
            {showBadge && (
              <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: isActive ? theme.primary : theme.textSecondary },
            ]}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <View
        style={videoCollapsed ? styles.videoHidden : undefined}
        onStartShouldSetResponder={() => { Keyboard.dismiss(); return false; }}
      >
        <VideoPlayer onVideoEnd={handleVideoEnd} />
      </View>

      {/* Collapse / expand toggle strip */}
      <TouchableOpacity
        onPress={() => setVideoCollapsed((v) => !v)}
        style={[styles.collapseStrip, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
        activeOpacity={0.7}
      >
        <View style={[styles.collapseHandle, { backgroundColor: theme.border }]} />
        <Ionicons
          name={videoCollapsed ? "chevron-down" : "chevron-up"}
          size={12}
          color={theme.textSecondary + "80"}
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        enabled={Platform.OS === "ios"}
        keyboardVerticalOffset={0}
      >
        {/* Combined bar: code | tabs | exit */}
        <View style={[styles.tabBarContainer, { borderBottomColor: theme.border, backgroundColor: theme.background }]}>
          {/* Left: room code */}
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(roomId || "");
              Toast.show({ type: "success", text1: "Copied", text2: "Room code copied!" });
            }}
            activeOpacity={0.7}
            style={[styles.roomCodeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Text style={[styles.roomCodeText, { color: theme.textSecondary }]}>{roomId}</Text>
            <Ionicons name="copy-outline" size={10} color={theme.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {/* Center: tabs */}
          <View style={[styles.tabTrack, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {renderTab(0, "play-outline", "Video")}
            {renderTab(1, "chatbubble-outline", "Chat")}
            {renderTab(2, "people-outline", state.participants?.length || 0)}
          </View>

          {/* Right: leave */}
          <TouchableOpacity
            onPress={handleLeave}
            activeOpacity={0.7}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            style={[styles.leaveBtn, { backgroundColor: theme.danger + "15", borderColor: theme.danger + "30" }]}
          >
            <Ionicons name="exit-outline" size={16} color={theme.danger} />
          </TouchableOpacity>
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
            {/* Tab 0: Load Video + Queue */}
            <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
              <ScrollView
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.videoTabScroll}
              >
                <UrlInput />
                <View style={[styles.queueDivider, { borderTopColor: theme.border }]}>
                  <Text style={[styles.queueSectionLabel, { color: theme.textSecondary }]}>
                    Up Next
                  </Text>
                </View>
                <QueuePanel myName={name || "Guest"} />
              </ScrollView>
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
  videoHidden: { display: "none" },
  collapseStrip: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    gap: 2,
  },
  collapseHandle: {
    width: 32,
    height: 3,
    borderRadius: 1.5,
    marginBottom: 1,
  },
  tabBarContainer: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabTrack: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 11,
    borderWidth: 1,
    padding: 3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 10,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: { fontSize: 12, fontWeight: "700" },
  roomControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roomCodeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
  },
  roomCodeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  leaveBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  toastInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
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
  videoTabScroll: {
    paddingTop: 12,
  },
  queueDivider: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginTop: 8,
  },
  queueSectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
