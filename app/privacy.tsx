import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

type Section = {
  icon: string;
  title: string;
  body: string;
};

const SECTIONS: Section[] = [
  {
    icon: "person-remove-outline",
    title: "No accounts, ever",
    body: "Watch Together requires no registration, email address, or personal information. You choose a display name when joining a room — that's it. Nothing is tied to your identity.",
  },
  {
    icon: "lock-closed-outline",
    title: "End-to-end encrypted chat",
    body: "All chat messages are encrypted on your device before being sent and decrypted only by other members of your room. The server never sees the plaintext content of your messages. Encryption uses AES-256-GCM with keys derived from the room code via HKDF-SHA256.",
  },
  {
    icon: "cloud-upload-outline",
    title: "Images",
    body: "Images you share in chat are uploaded to Cloudinary for storage and delivery. Image files are not end-to-end encrypted.",
  },
  {
    icon: "time-outline",
    title: "Temporary rooms",
    body: "Rooms and their chat history are not kept indefinitely. They are cleaned up automatically after a period of inactivity. No permanent record of your conversations is maintained.",
  },
  {
    icon: "bar-chart-outline",
    title: "No analytics or tracking",
    body: "We collect no analytics, crash reports, or usage data. No third-party SDKs for tracking are included. Your activity in the app stays on your device and in the room session.",
  },
  {
    icon: "wifi-outline",
    title: "What the server sees",
    body: "The server receives encrypted message payloads, image URLs, video URLs you share, room membership events (join/leave), and typing indicators. It cannot read your chat messages.",
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={[styles.heroBadge, { backgroundColor: theme.primaryMuted, borderColor: theme.primary + "30" }]}>
          <Ionicons name="shield-checkmark-outline" size={28} color={theme.primary} />
          <Text style={[styles.heroTitle, { color: theme.text }]}>Privacy by design</Text>
          <Text style={[styles.heroBody, { color: theme.textSecondary }]}>
            No accounts. No tracking. Encrypted messages. Here's exactly how your data is handled.
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map(({ icon, title, body }, i) => (
          <View
            key={i}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.cardIcon, { backgroundColor: theme.primaryMuted }]}>
              <Ionicons name={icon as any} size={18} color={theme.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.cardBody, { color: theme.textSecondary }]}>{body}</Text>
          </View>
        ))}

        <Text style={[styles.footer, { color: theme.textSecondary }]}>
          Last updated: June 2025
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  headerRight: { width: 34 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 14,
  },
  heroBadge: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heroBody: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
});
