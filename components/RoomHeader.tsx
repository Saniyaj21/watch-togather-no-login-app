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
    Toast.show({
      type: "success",
      text1: "Copied",
      text2: "Room code copied to clipboard!",
    });
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        {/* Left: logo mark */}
        <View style={styles.left}>
          <View
            style={[styles.logoMark, { backgroundColor: theme.primaryMuted, borderColor: theme.primary + "30" }]}
          >
            <Ionicons name="film-outline" size={15} color={theme.primary} />
          </View>
        </View>

        {/* Center: room code */}
        <TouchableOpacity
          onPress={copyRoomId}
          activeOpacity={0.7}
          style={[
            styles.roomBadge,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.roomIdText, { color: theme.textSecondary }]}>
            {roomId}
          </Text>
          <Ionicons
            name="copy-outline"
            size={11}
            color={theme.textSecondary}
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>

        {/* Right: icon-only leave button */}
        <View style={styles.right}>
          <TouchableOpacity
            onPress={onLeave}
            activeOpacity={0.7}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            style={[
              styles.leaveBtn,
              { backgroundColor: theme.danger + "15", borderColor: theme.danger + "30" },
            ]}
          >
            <Ionicons name="exit-outline" size={17} color={theme.danger} />
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
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  left: { flex: 1, flexDirection: "row", alignItems: "center" },
  right: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  roomIdText: {
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 1.5,
  },
  leaveBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveText: { fontWeight: "700", fontSize: 12 },
});
