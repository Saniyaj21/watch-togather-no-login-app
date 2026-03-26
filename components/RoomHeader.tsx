import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";

type Props = {
  roomId: string;
  onLeave: () => void;
};

export default function RoomHeader({ roomId, onLeave }: Props) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { state } = useRoom();

  const copyRoomId = async () => {
    await Clipboard.setStringAsync(roomId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.left}>
        <TouchableOpacity onPress={copyRoomId} style={[styles.roomIdBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.roomIdText}>{roomId}</Text>
          <Text style={styles.copyHint}>TAP TO COPY</Text>
        </TouchableOpacity>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: state.connected ? theme.success : theme.danger }]} />
          <Text style={[styles.participants, { color: theme.textSecondary }]}>
            {state.connected ? `${state.participants.length} ${state.participants.length === 1 ? "member" : "members"}` : "Connecting..."}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: theme.inputBackground }]}>
          <Text style={{ fontSize: 18 }}>{isDark ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onLeave} style={[styles.leaveBtn, { backgroundColor: theme.danger }]}>
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  roomIdBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomIdText: { color: "#FFF", fontWeight: "700", fontSize: 14, letterSpacing: 1 },
  copyHint: { color: "rgba(255,255,255,0.6)", fontSize: 8, textAlign: "center" },
  participants: { fontSize: 13 },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  leaveText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
});
