import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

const ROWS = [
  { icon: "color-palette-outline", label: "Theme", route: "/theme-settings" },
  { icon: "shield-checkmark-outline", label: "Privacy", route: "/privacy" },
  { icon: "information-circle-outline", label: "About", route: "/about" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();


  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: theme.primaryMuted,
                borderColor: theme.primary + "30",
              },
            ]}
          >
            <Ionicons name="settings-outline" size={22} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Customize your experience
          </Text>
        </View>

        <View style={styles.sections}>
          {ROWS.map(({ icon, label, route }) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.row,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              activeOpacity={route ? 0.7 : 1}
              onPress={() => route && router.push(route as any)}
            >
              <View style={[styles.rowIcon, { backgroundColor: theme.primaryMuted }]}>
                <Ionicons name={icon as any} size={17} color={theme.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary + "80"} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  sections: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
});
