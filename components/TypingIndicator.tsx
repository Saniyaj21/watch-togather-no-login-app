import React from "react";
import { Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type Props = { typingUsers: string[] };

export default function TypingIndicator({ typingUsers }: Props) {
  const { theme } = useTheme();

  if (typingUsers.length === 0) return null;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing...`
      : typingUsers.length === 2
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
      : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;

  return (
    <Text style={[styles.text, { color: theme.textSecondary }]}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    fontStyle: "italic",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
