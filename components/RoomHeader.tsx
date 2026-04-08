import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Toast } from "./Toast";
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
    Toast.show({ type: "success", text1: "Copied", text2: "Room ID copied to clipboard!" });
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.left}>
          <TouchableOpacity onPress={copyRoomId} activeOpacity={0.7} style={[styles.roomBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.roomIdText, { color: theme.textSecondary }]}>
               {roomId}
            </Text>
            <Ionicons name="copy-outline" size={12} color={theme.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.right}>
          <TouchableOpacity 
            onPress={onLeave} 
            activeOpacity={0.7}
            style={[styles.leaveBtn, { backgroundColor: theme.danger + "10", borderColor: theme.danger + "20" }]}
          >
            <Text style={[styles.leaveText, { color: theme.danger }]}>Leave</Text>
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
