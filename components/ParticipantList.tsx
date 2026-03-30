import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";

type Props = {
  visible?: boolean;
  onClose?: () => void;
  myName: string;
};

export default function ParticipantList({ visible, onClose, myName }: Props) {
  const { theme } = useTheme();
  const { state, kickUser } = useRoom();
  const isHost = state.hostName === myName;

  const isInline = visible === undefined;

  const listContent = (
    <View
      style={[
        isInline ? styles.inlineContainer : styles.modalContainer,
        { backgroundColor: isInline ? "transparent" : theme.surface, borderColor: theme.border + "1A" },
      ]}
    >
      {!isInline && (
        <View style={[styles.header, { borderBottomColor: theme.border + "1A" }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            Room Members
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {isInline && (
        <View style={styles.inlineHeader}>
          <Text style={[styles.inlineTitle, { color: theme.textSecondary }]}>
             MEMBERS ({state.participants.length})
          </Text>
        </View>
      )}

      <FlatList
        data={state.participants}
        keyExtractor={(item) => item.socketId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isMe = item.name === myName;
          const isParticipantHost = item.name === state.hostName;
          return (
            <View
              style={[
                styles.row,
                { backgroundColor: "rgba(32, 37, 52, 0.3)", borderColor: theme.border + "1A" },
              ]}
            >
              <View style={styles.nameContainer}>
                <View style={[styles.avatar, { backgroundColor: theme.primary + "26" }]}>
                   <Text style={[styles.avatarText, { color: theme.primary }]}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.name, { color: theme.text }]}>
                    {item.name} {isMe && <Text style={{ color: theme.textSecondary, fontSize: 12 }}> (You)</Text>}
                  </Text>
                  {isParticipantHost && (
                    <Text style={[styles.hostLabel, { color: theme.primary }]}>Room Host</Text>
                  )}
                </View>
              </View>
              {isHost && !isMe && (
                <TouchableOpacity
                  onPress={() => kickUser(item.socketId)}
                  style={[styles.kickBtn, { backgroundColor: "rgba(255, 69, 58, 0.1)", borderColor: "rgba(255, 69, 58, 0.2)" }]}
                >
                  <Text style={styles.kickText}>Kick</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            No one else is here yet
          </Text>
        }
      />
    </View>
  );

  // Inline mode: render directly without Modal
  if (isInline) {
    return listContent;
  }

  // Modal mode: wrap in Modal
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        {listContent}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    maxHeight: "70%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: "hidden",
  },
  inlineContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  inlineHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 40,
    gap: 8,
  },
  title: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  inlineTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  nameContainer: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  userInfo: { justifyContent: "center" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontWeight: "800", fontSize: 14 },
  name: { fontSize: 15, fontWeight: "700" },
  hostLabel: { fontSize: 10, fontWeight: "700", marginTop: 1, textTransform: "uppercase" },
  kickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  kickText: { color: "#ff453a", fontWeight: "700", fontSize: 11 },
  emptyText: { textAlign: "center", padding: 32, fontSize: 14 },
});

