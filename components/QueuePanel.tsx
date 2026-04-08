import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Toast } from "./Toast";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";

type Props = { myName: string };

export default function QueuePanel({ myName }: Props) {
  const { theme } = useTheme();
  const {
    state,
    removeFromQueue,
    reorderQueue,
    playQueueIndex,
  } = useRoom();

  const isHost = state.hostName === myName;

  const handleRemove = (index: number) => {
    removeFromQueue(index);
    Toast.show({ type: "info", text1: "Removed from queue" });
  };

  if (state.queue.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="list" size={32} color={theme.textSecondary + "66"} />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Queue is empty
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.textSecondary + "99" }]}>
          Use the Queue button above to add videos.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContent}>
      {state.queue.map((item, index) => {
        const isPlaying = index === state.currentQueueIndex;
        const displayUrl =
          item.url.length > 45 ? item.url.slice(0, 42) + "..." : item.url;

        return (
          <TouchableOpacity
            key={`queue-item-${index}`}
            onPress={() => playQueueIndex(index)}
            activeOpacity={0.7}
            style={[
              styles.queueItem,
              {
                backgroundColor: isPlaying ? theme.primary + "18" : theme.surface,
                borderColor: isPlaying ? theme.primary : theme.border,
              },
            ]}
          >
            {isPlaying && (
              <Ionicons
                name="volume-high"
                size={14}
                color={theme.primary}
                style={styles.playingIcon}
              />
            )}
            <View style={styles.itemInfo}>
              <Text style={[styles.itemUrl, { color: theme.text }]} numberOfLines={1}>
                {displayUrl}
              </Text>
              <Text style={[styles.itemMeta, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.videoType} · Added by {item.addedBy}
              </Text>
            </View>
            {isHost && (
              <View style={styles.hostControls}>
<TouchableOpacity
                  onPress={() => reorderQueue(index, index - 1)}
                  disabled={index === 0}
                  style={[styles.iconBtn, { backgroundColor: theme.border + "55", opacity: index === 0 ? 0.3 : 1 }]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                >
                  <Ionicons name="chevron-up" size={13} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => reorderQueue(index, index + 1)}
                  disabled={index === state.queue.length - 1}
                  style={[styles.iconBtn, { backgroundColor: theme.border + "55", opacity: index === state.queue.length - 1 ? 0.3 : 1 }]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                >
                  <Ionicons name="chevron-down" size={13} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemove(index)}
                  style={[styles.iconBtn, { backgroundColor: theme.danger + "22" }]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                >
                  <Ionicons name="trash-outline" size={13} color={theme.danger} />
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 12, gap: 8 },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  queueItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  playingIcon: {
    marginRight: 2,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemUrl: {
    fontSize: 13,
    fontWeight: "500",
  },
  itemMeta: {
    fontSize: 11,
  },
  hostControls: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
