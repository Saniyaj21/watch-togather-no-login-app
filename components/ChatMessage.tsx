import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type Props = {
  senderName: string;
  text: string;
  isSelf: boolean;
  showName: boolean;
  seenCount?: number;
};

export default function ChatMessage({ senderName, text, isSelf, showName, seenCount = 0 }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.container, 
      isSelf ? styles.alignEnd : styles.alignStart,
      !showName && { marginBottom: 4 } // Grouped messages are closer
    ]}>
      {showName && (
        <Text
          style={[
            styles.name,
            { color: isSelf ? theme.primary : theme.textSecondary },
          ]}
        >
          {senderName.toUpperCase()}
        </Text>
      )}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isSelf ? theme.chatBubbleSelf : theme.chatBubbleOther,
            borderColor: isSelf ? theme.primary + "33" : "transparent",
            borderWidth: isSelf ? 1 : 0,
            borderTopRightRadius: (isSelf && showName) ? 0 : 14,
            borderTopLeftRadius: (!isSelf && showName) ? 0 : 14,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isSelf ? theme.chatBubbleSelfText : theme.chatBubbleOtherText },
          ]}
        >
          {text}
        </Text>
      </View>
      {isSelf && seenCount > 0 && (
        <Text style={[styles.seenText, { color: theme.textSecondary }]}>
          Seen by {seenCount}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 2,
    maxWidth: "80%",
    marginBottom: 10,
  },
  alignStart: { alignSelf: "flex-start", alignItems: "flex-start" },
  alignEnd: { alignSelf: "flex-end", alignItems: "flex-end" },
  name: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  text: { fontSize: 14, lineHeight: 18 },
  seenText: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    marginRight: 4,
  },
});
