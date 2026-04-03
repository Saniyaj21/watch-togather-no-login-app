import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  Platform,
  LayoutAnimation,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

type ReplyingTo = {
  messageId: string;
  senderName: string;
  textSnippet: string;
} | null;

type EditingMessage = {
  messageId: string;
  currentText: string;
} | null;

type Props = { myName: string };

export default function ChatPanel({ myName }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    state,
    sendChat,
    sendTyping,
    markSeen,
    editMessage,
    deleteMessage,
    loadMoreMessages,
  } = useRoom();

  const [text, setText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo>(null);
  const [editingMessage, setEditingMessage] = useState<EditingMessage>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  // Track scroll position so we know whether the user is near the top
  const scrollYRef = useRef(0);
  // For restoring scroll after prepend
  const contentHeightRef = useRef(0);
  const wasLoadingMoreRef = useRef(false);
  const isHost = state.hostName === myName;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
      (e) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    // Only auto-scroll to bottom for new incoming messages (not load-more prepends)
    if (state.messages.length > 0 && !state.isLoadingMore) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    // Mark messages as seen whenever the list updates (panel is mounted = chat tab is open)
    const lastReal = [...state.messages].reverse().find((m) => !m.isSystem);
    if (lastReal) markSeen(lastReal.createdAt as string);
  }, [state.messages.length]);

  useEffect(() => {
    if (state.typingUsers.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [state.typingUsers.length]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [state.seenData]);

  // Track when loadingMore transitions false→true so we can restore scroll
  useEffect(() => {
    wasLoadingMoreRef.current = state.isLoadingMore;
  }, [state.isLoadingMore]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (editingMessage) {
      editMessage(editingMessage.messageId, trimmed);
      setEditingMessage(null);
    } else {
      sendChat(trimmed, replyingTo?.messageId);
      setReplyingTo(null);
    }
    setText("");
  };

  const handleTextChange = (val: string) => {
    setText(val);
    if (val.trim()) sendTyping();
  };

  const handleReply = (messageId: string) => {
    const msg = state.messages.find((m) => m._id === messageId);
    if (!msg || msg.isDeleted) return;
    setEditingMessage(null);
    setReplyingTo({
      messageId,
      senderName: msg.senderName,
      textSnippet: msg.text.slice(0, 80),
    });
  };

  const handleEdit = (messageId: string, currentText: string) => {
    setReplyingTo(null);
    setEditingMessage({ messageId, currentText });
    setText(currentText);
  };

  const handleDelete = (messageId: string) => {
    deleteMessage(messageId);
  };

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollYRef.current = y;

    // Trigger load more when near the top
    if (y < 100 && !state.isLoadingMore && state.hasMoreMessages) {
      loadMoreMessages();
    }
  };

  const handleContentSizeChange = (_: number, newHeight: number) => {
    const oldHeight = contentHeightRef.current;
    contentHeightRef.current = newHeight;

    // After prepend: restore scroll so user stays at same visual position
    if (wasLoadingMoreRef.current && oldHeight > 0 && newHeight > oldHeight) {
      const heightDiff = newHeight - oldHeight;
      flatListRef.current?.scrollToOffset({
        offset: scrollYRef.current + heightDiff,
        animated: false,
      });
    }
  };

  // Index of the last message sent by self (non-system) — for read receipt placement
  const lastSelfIndex = state.messages.reduce(
    (acc, m, i) => (!m.isSystem && m.senderName === myName ? i : acc),
    -1
  );

  // Count of others who have seen up to a given message's createdAt
  const seenCountFor = (createdAt: string) =>
    state.seenData.filter(
      (s) => s.name !== myName && s.lastSeenAt >= createdAt
    ).length;

  const ListHeaderComponent = () => {
    if (state.isLoadingMore) {
      return (
        <View style={styles.loadMoreHeader}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      );
    }
    if (!state.hasMoreMessages && state.messages.filter((m) => !m.isSystem).length > 0) {
      return (
        <View style={styles.loadMoreHeader}>
          <Text style={[styles.beginningText, { color: theme.textSecondary }]}>
            Beginning of conversation
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={state.messages}
        keyExtractor={(item, i) =>
          item._id ? item._id : `${item.createdAt}-${item.senderName}-${i}`
        }
        onScrollBeginDrag={() => setSelectedMessageId(null)}
        renderItem={({ item, index }) => {
          if (item.isSystem) {
            return (
              <View style={styles.systemChipRow}>
                <View
                  style={[
                    styles.systemChip,
                    { backgroundColor: theme.border + "33" },
                  ]}
                >
                  <Text
                    style={[
                      styles.systemChipText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }

          const prevMessage = index > 0 ? state.messages[index - 1] : null;
          const nextMessage = index < state.messages.length - 1 ? state.messages[index + 1] : null;
          const showName =
            !prevMessage ||
            prevMessage.senderName !== item.senderName ||
            prevMessage.isSystem;
          const isLastInGroup =
            !nextMessage ||
            nextMessage.senderName !== item.senderName ||
            nextMessage.isSystem;
          const seenCount =
            index === lastSelfIndex ? seenCountFor(item.createdAt as string) : 0;

          return (
            <ChatMessage
              messageId={item._id}
              senderName={item.senderName}
              text={item.text}
              isSelf={item.senderName === myName}
              showName={showName}
              isLastInGroup={isLastInGroup}
              seenCount={seenCount}
              isDeleted={item.isDeleted}
              editedAt={item.editedAt}
              replyTo={item.replyTo}
              isSelected={selectedMessageId === item._id}
              onSelect={setSelectedMessageId}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isHost={isHost}
            />
          );
        }}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={<TypingIndicator typingUsers={state.typingUsers} />}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={100}
        onContentSizeChange={handleContentSizeChange}
      />

      {/* Reply preview bar */}
      {replyingTo && (
        <View
          style={[
            styles.contextBar,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
              borderLeftColor: theme.primary,
            },
          ]}
        >
          <View style={styles.contextBarContent}>
            <Text style={[styles.contextBarLabel, { color: theme.primary }]}>
              Replying to {replyingTo.senderName}
            </Text>
            <Text
              style={[styles.contextBarSnippet, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {replyingTo.textSnippet}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setReplyingTo(null)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Editing preview bar */}
      {editingMessage && (
        <View
          style={[
            styles.contextBar,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
              borderLeftColor: theme.primary,
            },
          ]}
        >
          <View style={styles.contextBarContent}>
            <Text style={[styles.contextBarLabel, { color: theme.primary }]}>
              Editing message
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setEditingMessage(null);
              setText("");
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[
          styles.inputRow,
          {
            paddingBottom:
              Platform.OS === "android"
                ? keyboardHeight > 0
                  ? keyboardHeight + 17
                  : insets.bottom
                : keyboardHeight > 0
                ? 0
                : insets.bottom,
          },
        ]}
      >
        <View
          style={[
            styles.inputInner,
            { borderColor: theme.border, backgroundColor: theme.surface },
          ]}
        >
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={text}
            onChangeText={handleTextChange}
            placeholder={editingMessage ? "Edit message..." : "Type a message..."}
            placeholderTextColor={theme.textSecondary + "80"}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
            onPress={handleSend}
            activeOpacity={0.7}
          >
            <Ionicons
              name={editingMessage ? "checkmark" : "send"}
              size={18}
              color={theme.background}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingVertical: 12, paddingHorizontal: 14 },
  loadMoreHeader: {
    alignItems: "center",
    paddingVertical: 12,
  },
  beginningText: {
    fontSize: 12,
    fontWeight: "500",
  },
  contextBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderLeftWidth: 3,
    gap: 8,
  },
  contextBarContent: {
    flex: 1,
  },
  contextBarLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 1,
  },
  contextBarSnippet: {
    fontSize: 12,
  },
  inputRow: {
    paddingHorizontal: 8,
    paddingBottom: 0,
    paddingTop: 0,
  },
  inputInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  systemChipRow: {
    alignItems: "center",
    marginVertical: 6,
  },
  systemChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  systemChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
