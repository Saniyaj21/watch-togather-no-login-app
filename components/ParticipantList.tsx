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

const AVATAR_PALETTE = [
  "#6366F1",
  "#EC4899",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export default function ParticipantList({ visible, onClose, myName }: Props) {
  const { theme } = useTheme();
  const { state, kickUser } = useRoom();
  const isHost = state.hostName === myName;
  const isInline = visible === undefined;

  const listContent = (
    <View
      style={[
        isInline ? styles.inlineContainer : styles.modalContainer,
        {
          backgroundColor: isInline ? "transparent" : theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Modal header */}
      {!isInline && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Members</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {state.participants.length} in room
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            style={[
              styles.closeBtn,
              { backgroundColor: theme.surface2, borderColor: theme.border },
            ]}
          >
            <Ionicons name="close" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Inline header */}
      {isInline && (
        <View style={styles.inlineHeader}>
          <Text style={[styles.inlineTitle, { color: theme.textSecondary }]}>
            MEMBERS
          </Text>
          <View style={[styles.countBadge, { backgroundColor: theme.primaryMuted, borderColor: theme.primary + "30" }]}>
            <Text style={[styles.countText, { color: theme.primary }]}>
              {state.participants.length}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={state.participants}
        keyExtractor={(item) => item.socketId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isMe = item.name === myName;
          const isParticipantHost = item.name === state.hostName;
          const avatarColor = getAvatarColor(item.name);

          return (
            <View
              style={[
                styles.row,
                {
                  backgroundColor: theme.surface2,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.nameContainer}>
                {/* Avatar */}
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: avatarColor + "22",
                      borderColor: avatarColor + "44",
                    },
                  ]}
                >
                  <Text style={[styles.avatarText, { color: avatarColor }]}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                {/* Online dot */}
                <View
                  style={[
                    styles.onlineDot,
                    { backgroundColor: theme.success, borderColor: theme.surface },
                  ]}
                />

                {/* Name + role */}
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    {isMe && (
                      <View
                        style={[
                          styles.youBadge,
                          { backgroundColor: theme.border },
                        ]}
                      >
                        <Text
                          style={[
                            styles.youText,
                            { color: theme.textSecondary },
                          ]}
                        >
                          You
                        </Text>
                      </View>
                    )}
                  </View>
                  {isParticipantHost && (
                    <View style={styles.hostRow}>
                      <Ionicons
                        name="shield-checkmark"
                        size={10}
                        color={theme.primary}
                        style={{ marginRight: 3 }}
                      />
                      <Text
                        style={[styles.hostLabel, { color: theme.primary }]}
                      >
                        Host
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Kick button */}
              {isHost && !isMe && (
                <TouchableOpacity
                  onPress={() => kickUser(item.socketId)}
                  style={[
                    styles.kickBtn,
                    {
                      backgroundColor: theme.danger + "15",
                      borderColor: theme.danger + "30",
                    },
                  ]}
                >
                  <Text style={[styles.kickText, { color: theme.danger }]}>
                    Kick
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons
              name="people-outline"
              size={32}
              color={theme.textSecondary + "60"}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No one else here yet
            </Text>
          </View>
        }
      />
    </View>
  );

  if (isInline) return listContent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        {listContent}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { fontSize: 13, fontWeight: "500", marginTop: 1 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  countText: { fontSize: 11, fontWeight: "700" },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 40,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
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
  avatarText: { fontWeight: "800", fontSize: 14 },
  onlineDot: {
    position: "absolute",
    left: 28,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  userInfo: { justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 14, fontWeight: "700" },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youText: { fontSize: 10, fontWeight: "700" },
  hostRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  hostLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  kickBtn: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  kickText: { fontWeight: "700", fontSize: 11 },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
