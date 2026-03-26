import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useRoom } from "../contexts/RoomContext";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

type Props = { myName: string };

export default function ChatPanel({ myName }: Props) {
  const { theme } = useTheme();
  const { state, sendChat, sendTyping } = useRoom();
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (state.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [state.messages.length]);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={state.messages}
        keyExtractor={(item, i) => `${item.createdAt}-${item.senderName}-${i}`}
        renderItem={({ item }) => (
          <ChatMessage
            senderName={item.senderName}
            text={item.text}
            isSelf={item.senderName === myName}
          />
        )}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
      <TypingIndicator typingUsers={state.typingUsers} />
      <View
        style={[
          styles.inputRow,
          { borderTopColor: theme.border, backgroundColor: theme.background },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendBtn, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingVertical: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 14,
  },
  sendBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#FFF", fontWeight: "600" },
});
