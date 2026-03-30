import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";
import ParticipantList from "./ParticipantList";

type Props = {
  roomId: string;
  myName: string;
  onLeave: () => void;
};

export default function RoomHeader({ roomId, myName, onLeave }: Props) {
  const { theme } = useTheme();
  const { state } = useRoom();
  const [showParticipants, setShowParticipants] = useState(false);

  const copyRoomId = async () => {
    await Clipboard.setStringAsync(roomId);
    Alert.alert("Copied", "Room ID copied to clipboard!");
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: "rgba(10, 14, 24, 0.8)", borderBottomColor: theme.border + "1A" }]}>
        <View style={styles.left}>
          <TouchableOpacity onPress={copyRoomId} activeOpacity={0.7} style={[styles.roomBadge, { backgroundColor: theme.primary + "1A", borderColor: theme.primary + "33" }]}>
            <Text style={[styles.roomIdText, { color: theme.primary }]}>
               {roomId}
            </Text>
            <Ionicons name="copy-outline" size={12} color={theme.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.right}>
          <TouchableOpacity 
            onPress={onLeave} 
            activeOpacity={0.7}
            style={[styles.leaveBtn, { backgroundColor: "rgba(255, 69, 58, 0.1)", borderColor: "rgba(255, 69, 58, 0.2)" }]}
          >
            <Text style={[styles.leaveText, { color: "#ff453a" }]}>Leave</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ParticipantList
        visible={showParticipants}
        onClose={() => setShowParticipants(false)}
        myName={myName}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  left: { flexDirection: "row", alignItems: "center" },
  right: { flexDirection: "row", alignItems: "center" },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  roomIdText: { fontWeight: "800", fontSize: 13, letterSpacing: 1 },
  leaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  leaveText: { fontWeight: "700", fontSize: 13 },
});
