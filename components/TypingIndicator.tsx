import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type Props = { typingUsers: string[] };

function BouncingDot({ delay }: { delay: number }) {
  const { theme } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -5, duration: 250, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.delay(500),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: theme.textSecondary, transform: [{ translateY: anim }] },
      ]}
    />
  );
}

export default function TypingIndicator({ typingUsers }: Props) {
  const { theme } = useTheme();

  if (typingUsers.length === 0) return null;

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : typingUsers.length === 2
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
      : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;

  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        <BouncingDot delay={0} />
        <BouncingDot delay={150} />
        <BouncingDot delay={300} />
      </View>
      <Text style={[styles.name, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: "600",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
