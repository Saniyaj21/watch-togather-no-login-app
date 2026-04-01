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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

type Props = { myName: string };

export default function ChatPanel({ myName }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, sendChat, sendTyping, markSeen } = useRoom();
  const [text, setText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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
    if (state.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    // Mark messages as seen whenever the list updates (panel is mounted = chat tab is open)
    const lastReal = [...state.messages].reverse().find((m) => !m.isSystem);
    if (lastReal) markSeen(lastReal.createdAt);
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

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendChat(trimmed);
    setText("");
  };

  const handleTextChange = (val: string) => {
    setText(val);
    if (val.trim()) sendTyping();
  };

  // Index of the last message sent by self (non-system) — for read receipt placement
  const lastSelfIndex = state.messages.reduce(
    (acc, m, i) => (!m.isSystem && m.senderName === myName ? i : acc),
    -1
  );

  // Count of others who have seen up to a given message's createdAt
  const seenCountFor = (createdAt: string) =>
    state.seenData.filter((s) => s.name !== myName && s.lastSeenAt >= createdAt).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={state.messages}
        keyExtractor={(item, i) => `${item.createdAt}-${item.senderName}-${i}`}
        renderItem={({ item, index }) => {
          if (item.isSystem) {
            return (
              <View style={styles.systemChipRow}>
                <View style={[styles.systemChip, { backgroundColor: theme.border + "33" }]}>
                  <Text style={[styles.systemChipText, { color: theme.textSecondary }]}>{item.text}</Text>
                </View>
              </View>
            );
          }

          const prevMessage = index > 0 ? state.messages[index - 1] : null;
          const showName = !prevMessage || prevMessage.senderName !== item.senderName || prevMessage.isSystem;
          const seenCount = index === lastSelfIndex ? seenCountFor(item.createdAt) : 0;

          return (
            <ChatMessage
              senderName={item.senderName}
              text={item.text}
              isSelf={item.senderName === myName}
              showName={showName}
              seenCount={seenCount}
            />
          );
        }}
        ListFooterComponent={<TypingIndicator typingUsers={state.typingUsers} />}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
      <View style={[
        styles.inputRow, 
        { paddingBottom: Platform.OS === 'android' ? (keyboardHeight > 0 ? keyboardHeight + 17 : insets.bottom) : (keyboardHeight > 0 ? 0 : insets.bottom) }
      ]}>
        <View style={[styles.inputInner, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary + "80"}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
            onPress={handleSend}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={18} color={theme.background} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingVertical: 16, paddingHorizontal: 20 },
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

