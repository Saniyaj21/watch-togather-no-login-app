import React, { useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { RoomProvider, useRoom } from "../../contexts/RoomContext";
import RoomHeader from "../../components/RoomHeader";
import VideoPlayer from "../../components/VideoPlayer";
import UrlInput from "../../components/UrlInput";
import ChatPanel from "../../components/ChatPanel";

function RoomContent() {
  const { roomId, name } = useLocalSearchParams<{
    roomId: string;
    name: string;
  }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { state } = useRoom();

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <RoomHeader roomId={roomId || ""} myName={name || "Guest"} onLeave={handleLeave} />
      <VideoPlayer />
      <UrlInput />
      <View style={styles.chatContainer}>
        <ChatPanel myName={name || "Guest"} />
      </View>
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
  chatContainer: { flex: 1 },
});
