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
  NativeScrollEvent
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
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleTabPress(index)}
        style={styles.tab}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          <Ionicons
            name={icon}
            size={15}
            color={isActive ? theme.primary : theme.textSecondary}
            style={{ marginRight: 5 }}
          />
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
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
              contentOffset={{ x: SCREEN_WIDTH, y: 0 }} // default state tab 1
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
  listContent: { paddingVertical: 6, paddingHorizontal: 8 },
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
  }
});

