import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";

type Props = {
  visible: boolean;
  onClose: () => void;
  myName: string;
};

export default function ParticipantList({ visible, onClose, myName }: Props) {
  const { theme } = useTheme();
  const { state, kickUser } = useRoom();
  const isHost = state.hostName === myName;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Members ({state.participants.length})
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={state.participants}
            keyExtractor={(item) => item.socketId}
            renderItem={({ item }) => {
              const isMe = item.name === myName;
              const isParticipantHost = item.name === state.hostName;
              return (
                <View
                  style={[
                    styles.row,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <View style={styles.nameContainer}>
                    <Text style={[styles.name, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    {isParticipantHost && (
                      <View
                        style={[
                          styles.hostBadge,
                          { backgroundColor: theme.primary },
                        ]}
                      >
                        <Text style={styles.hostBadgeText}>HOST</Text>
                      </View>
                    )}
                    {isMe && (
                      <Text
                        style={[styles.youLabel, { color: theme.textSecondary }]}
                      >
                        (You)
                      </Text>
                    )}
                  </View>
                  {isHost && !isMe && (
                    <TouchableOpacity
                      onPress={() => kickUser(item.socketId)}
                      style={[styles.kickBtn, { backgroundColor: theme.danger }]}
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
                No participants yet
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    maxHeight: "60%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: { fontSize: 17, fontWeight: "700" },
  closeBtn: { fontSize: 15, fontWeight: "500" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  nameContainer: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  name: { fontSize: 15, fontWeight: "500" },
  hostBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hostBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  youLabel: { fontSize: 13 },
  kickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  kickText: { color: "#FFF", fontWeight: "600", fontSize: 12 },
  emptyText: { textAlign: "center", padding: 20 },
});
