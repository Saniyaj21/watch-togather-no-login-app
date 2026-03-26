import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type Props = {
  senderName: string;
  text: string;
  isSelf: boolean;
};

export default function ChatMessage({ senderName, text, isSelf }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.row, isSelf && styles.rowSelf]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isSelf
              ? theme.chatBubbleSelf
              : theme.chatBubbleOther,
          },
          isSelf && styles.bubbleSelf,
        ]}
      >
        {!isSelf && (
          <Text style={[styles.name, { color: theme.primary }]}>
            {senderName}
          </Text>
        )}
        <Text
          style={[
            styles.text,
            {
              color: isSelf
                ? theme.chatBubbleSelfText
                : theme.chatBubbleOtherText,
            },
          ]}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: 2,
    paddingHorizontal: 12,
  },
  rowSelf: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bubbleSelf: {
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 16,
  },
  name: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  text: { fontSize: 15, lineHeight: 20 },
});
