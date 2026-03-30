import React, { useState, useRef, useEffect } from "react";
import {
  View,
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
  const { state, sendChat, sendTyping } = useRoom();
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={state.messages}
        keyExtractor={(item, i) => `${item.createdAt}-${item.senderName}-${i}`}
        renderItem={({ item, index }) => {
          const prevMessage = index > 0 ? state.messages[index - 1] : null;
          const showName = !prevMessage || prevMessage.senderName !== item.senderName;
          
          return (
            <ChatMessage
              senderName={item.senderName}
              text={item.text}
              isSelf={item.senderName === myName}
              showName={showName}
            />
          );
        }}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
      <TypingIndicator typingUsers={state.typingUsers} />
      <View style={[
        styles.inputRow, 
        { paddingBottom: Platform.OS === 'android' ? (keyboardHeight > 0 ? keyboardHeight + 17 : insets.bottom) : (keyboardHeight > 0 ? 0 : insets.bottom) }
      ]}>
        <View style={[styles.inputInner, { borderColor: theme.border + "33" }]}>
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
            <Ionicons name="send" size={18} color="#39008c" />
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
    backgroundColor: "rgba(32, 37, 52, 0.5)",
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
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
});

