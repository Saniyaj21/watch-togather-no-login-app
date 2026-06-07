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

const FEATURES = [
  { icon: "play-circle-outline", text: "Watch YouTube & videos together in sync" },
  { icon: "lock-closed-outline", text: "End-to-end encrypted chat" },
  { icon: "people-outline", text: "No account or sign-up required" },
  { icon: "image-outline", text: "Share images in chat" },
  { icon: "list-outline", text: "Queue videos for continuous playback" },
  { icon: "moon-outline", text: "Light, dark, and system theme support" },
];

export default function AboutScreen() {
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>About</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* App identity */}
        <View style={styles.identity}>
          <View style={[styles.appIcon, { backgroundColor: theme.primaryMuted, borderColor: theme.primary + "30" }]}>
            <Ionicons name="tv-outline" size={36} color={theme.primary} />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Watch Together</Text>
          <Text style={[styles.appVersion, { color: theme.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
            Watch anything, with anyone, anywhere.
          </Text>
        </View>

        {/* Features */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>FEATURES</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {FEATURES.map(({ icon, text }, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              <View style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: theme.primaryMuted }]}>
                  <Ionicons name={icon as any} size={16} color={theme.primary} />
                </View>
                <Text style={[styles.featureText, { color: theme.text }]}>{text}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Built with */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>BUILT WITH</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {[
            { label: "Framework", value: "React Native + Expo" },
            { label: "Real-time", value: "Socket.IO" },
            { label: "Backend", value: "Express + MongoDB" },
            { label: "Encryption", value: "AES-256-GCM (E2E)" },
            { label: "Media", value: "Cloudinary" },
          ].map(({ label, value }, i, arr) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>{label}</Text>
                <Text style={[styles.metaValue, { color: theme.text }]}>{value}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <Text style={[styles.footer, { color: theme.textSecondary }]}>
          Made with care. No ads, no tracking, no accounts.
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
    paddingTop: 28,
    paddingBottom: 48,
  },
  identity: {
    alignItems: "center",
    marginBottom: 36,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  appName: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 10,
  },
  appTagline: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
    overflow: "hidden",
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
