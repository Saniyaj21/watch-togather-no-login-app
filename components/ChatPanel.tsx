import React, { useState, useRef, useEffect, useMemo } from "react";
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
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";
import { uploadImage } from "../lib/api";
import ChatMessage from "./ChatMessage";
import ImageCollage from "./ImageCollage";
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

// ─── Message grouping ────────────────────────────────────────────────────────

type MsgDisplayItem = {
  type: "msg";
  data: any;
  origIndex: number;
};

type CollageDisplayItem = {
  type: "collage";
  images: string[];
  messageIds: string[];
  senderName: string;
  firstData: any;
  lastData: any;
  lastOrigIndex: number;
  id: string;
};

type DisplayItem = MsgDisplayItem | CollageDisplayItem;

function isImageOnly(msg: any): boolean {
  return !!(msg.imageUrl && !msg.text?.trim() && !msg.isSystem && !msg.isDeleted);
}

function groupMessages(messages: any[]): DisplayItem[] {
  const result: DisplayItem[] = [];
  let i = 0;
  while (i < messages.length) {
    const msg = messages[i];
    if (isImageOnly(msg)) {
      const sender = msg.senderName;
      const group: { data: any; origIndex: number }[] = [{ data: msg, origIndex: i }];
      let j = i + 1;
      while (j < messages.length && isImageOnly(messages[j]) && messages[j].senderName === sender) {
        group.push({ data: messages[j], origIndex: j });
        j++;
      }
      if (group.length >= 2) {
        result.push({
          type: "collage",
          images: group.map((g) => g.data.imageUrl as string),
          messageIds: group.map((g) => g.data._id as string),
          senderName: sender,
          firstData: group[0].data,
          lastData: group[group.length - 1].data,
          lastOrigIndex: group[group.length - 1].origIndex,
          id: group[0].data._id ?? `collage-${i}`,
        });
        i = j;
        continue;
      }
    }
    result.push({ type: "msg", data: msg, origIndex: i });
    i++;
  }
  return result;
}

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
  const [isUploading, setIsUploading] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const scrollYRef = useRef(0);
  // For restoring scroll after prepend
  const contentHeightRef = useRef(0);
  const wasLoadingMoreRef = useRef(false);
  const isHost = state.hostName === myName;

  const displayItems = useMemo(() => groupMessages(state.messages), [state.messages]);

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
      sendChat(trimmed, replyingTo?.messageId, replyingTo?.textSnippet ?? undefined);
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
    const snippet = msg.text?.trim()
      ? msg.text.slice(0, 80)
      : msg.imageUrl
      ? "📷 Photo"
      : "";
    setReplyingTo({
      messageId,
      senderName: msg.senderName,
      textSnippet: snippet,
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

  const handleImagePick = async (source: "gallery" | "camera") => {
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
    }

    const result = await (source === "camera"
      ? ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false })
      : ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.85, allowsEditing: false }));
    if (result.canceled) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(result.assets[0].uri);
      sendChat("", replyingTo?.messageId, replyingTo?.textSnippet ?? undefined, url);
      setReplyingTo(null);
    } catch {
      // silent fail — could show a toast here
    } finally {
      setIsUploading(false);
    }
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

  // Original index of the last message sent by self — for read receipt placement
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
    <View style={[styles.container, { backgroundColor: theme.background }]} onTouchStart={() => setSelectedMessageId(null)}>
      <View style={[styles.e2eBadge, { borderBottomColor: theme.border }]}>
        <Ionicons name="lock-closed" size={9} color={theme.textSecondary + "90"} />
        <Text style={[styles.e2eText, { color: theme.textSecondary + "90" }]}>
          End-to-end encrypted
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={displayItems}
        keyExtractor={(item, i) => {
          if (item.type === "collage") return item.id;
          const m = item.data;
          return m._id ? m._id : `${m.createdAt}-${m.senderName}-${i}`;
        }}
        onScrollBeginDrag={() => setSelectedMessageId(null)}
        renderItem={({ item, index }) => {
          // ── Collage ────────────────────────────────────────────────────────
          if (item.type === "collage") {
            const isSelf = item.senderName === myName;
            const prevItem = index > 0 ? displayItems[index - 1] : null;
            const prevSender = prevItem?.type === "msg"
              ? prevItem.data.senderName
              : prevItem?.type === "collage"
              ? prevItem.senderName
              : null;
            const showName = !isSelf && prevSender !== item.senderName;
            const isLastSelf =
              isSelf && item.lastOrigIndex === lastSelfIndex;
            const seenCount = isLastSelf
              ? seenCountFor(item.lastData.createdAt as string)
              : 0;

            const R = 18;
            const borderRadius = {
              borderTopLeftRadius: !isSelf && showName ? 4 : R,
              borderTopRightRadius: isSelf && showName ? 4 : R,
              borderBottomLeftRadius: R,
              borderBottomRightRadius: R,
            };

            return (
              <View style={[colStyles.wrapper, isSelf ? colStyles.wrapperEnd : colStyles.wrapperStart]}>
                {showName && (
                  <Text style={[colStyles.name, { color: theme.primary }]}>
                    {item.senderName}
                  </Text>
                )}
                <ImageCollage
                  items={item.images.map((uri, idx) => ({ uri, messageId: item.messageIds[idx] }))}
                  borderRadius={borderRadius}
                  isSelf={isSelf}
                  isHost={isHost}
                  onReply={handleReply}
                  onDelete={handleDelete}
                />
                {isLastSelf && seenCount > 0 && (
                  <View style={colStyles.seenRow}>
                    <Ionicons name="checkmark-done" size={12} color={theme.primary} />
                    <Text style={[colStyles.seenText, { color: theme.textSecondary }]}>{seenCount}</Text>
                  </View>
                )}
              </View>
            );
          }

          // ── Regular message ────────────────────────────────────────────────
          const msg = item.data;
          const origIndex = item.origIndex;

          if (msg.isSystem) {
            return (
              <View style={styles.systemChipRow}>
                <View style={[styles.systemChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.systemChipText, { color: theme.textSecondary }]}>{msg.text}</Text>
                </View>
              </View>
            );
          }

          const prevItem = index > 0 ? displayItems[index - 1] : null;
          const nextItem = index < displayItems.length - 1 ? displayItems[index + 1] : null;
          const prevSender = prevItem?.type === "msg"
            ? prevItem.data.senderName
            : prevItem?.type === "collage"
            ? prevItem.senderName
            : null;
          const nextSender = nextItem?.type === "msg"
            ? nextItem.data.senderName
            : nextItem?.type === "collage"
            ? nextItem.senderName
            : null;
          const isPrevSystem = prevItem?.type === "msg" && prevItem.data.isSystem;
          const isNextSystem = nextItem?.type === "msg" && nextItem.data.isSystem;

          const showName = !prevItem || prevSender !== msg.senderName || isPrevSystem;
          const isLastInGroup = !nextItem || nextSender !== msg.senderName || isNextSystem;
          const seenCount = origIndex === lastSelfIndex ? seenCountFor(msg.createdAt as string) : 0;

          return (
            <ChatMessage
              messageId={msg._id}
              senderName={msg.senderName}
              text={msg.text}
              isSelf={msg.senderName === myName}
              showName={showName}
              isLastInGroup={isLastInGroup}
              seenCount={seenCount}
              isDeleted={msg.isDeleted}
              editedAt={msg.editedAt}
              replyTo={msg.replyTo}
              isSelected={selectedMessageId === msg._id}
              onSelect={setSelectedMessageId}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isHost={isHost}
              imageUrl={msg.imageUrl}
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
            <Ionicons name="close" size={17} color={theme.textSecondary} />
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
            <Ionicons name="close" size={17} color={theme.textSecondary} />
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
                  ? keyboardHeight + insets.bottom
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
            {
              borderColor: text.length > 0 ? theme.primary + "60" : theme.border,
              backgroundColor: theme.surface,
            },
          ]}
        >
          {!editingMessage && (
            <>
              <TouchableOpacity
                onPress={() => handleImagePick("camera")}
                disabled={isUploading}
                hitSlop={{ top: 8, right: 4, bottom: 8, left: 4 }}
                style={styles.imageBtn}
              >
                <Ionicons name="camera-outline" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleImagePick("gallery")}
                disabled={isUploading}
                hitSlop={{ top: 8, right: 4, bottom: 8, left: 4 }}
                style={styles.imageBtn}
              >
                {isUploading ? (
                  <ActivityIndicator size={16} color={theme.textSecondary} />
                ) : (
                  <Ionicons name="image-outline" size={20} color={theme.textSecondary} />
                )}
              </TouchableOpacity>
            </>
          )}
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={text}
            onChangeText={handleTextChange}
            placeholder={editingMessage ? "Edit message..." : "Message..."}
            placeholderTextColor={theme.textSecondary + "70"}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            multiline={false}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: text.trim() ? theme.primary : theme.surface2,
                borderColor: text.trim() ? "transparent" : theme.border,
              },
            ]}
            onPress={handleSend}
            activeOpacity={0.75}
          >
            <Ionicons
              name={editingMessage ? "checkmark" : "arrow-up"}
              size={17}
              color={text.trim() ? theme.chatBubbleSelfText : theme.textSecondary}
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
  listContent: { paddingVertical: 14, paddingHorizontal: 14 },
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
    paddingVertical: 9,
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
    paddingHorizontal: 10,
    paddingBottom: 0,
    paddingTop: 6,
  },
  inputInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 26,
    borderWidth: 1.5,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 7,
  },
  imageBtn: {
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  systemChipRow: {
    alignItems: "center",
    marginVertical: 6,
  },
  systemChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  systemChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  e2eBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  e2eText: {
    fontSize: 10,
    fontWeight: "500",
  },
});

// Collage wrapper styles (mirrors ChatMessage wrapper pattern)
const colStyles = StyleSheet.create({
  wrapper: {
    maxWidth: "78%",
    marginBottom: 2,
  },
  wrapperStart: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
    paddingLeft: 16,
  },
  wrapperEnd: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
    paddingRight: 16,
  },
  name: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 3,
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  seenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
    marginRight: 4,
  },
  seenText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
