import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";

const ROWS = [
  { icon: "color-palette-outline", label: "Theme", route: "/theme-settings" },
  { icon: "shield-checkmark-outline", label: "Privacy", route: "/privacy" },
  { icon: "information-circle-outline", label: "About", route: "/about" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { name, setName } = useUser();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<TextInput>(null);

  const startEditing = () => {
    setDraft(name);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveName = () => {
    const trimmed = draft.trim();
    if (trimmed) setName(trimmed);
    setEditing(false);
  };

  const cancelEditing = () => {
    setEditing(false);
    setDraft(name);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        {/* Display Name Card */}
        <View
          style={[
            styles.nameCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.nameAvatarWrap, { backgroundColor: theme.primary + "22", borderColor: theme.primary + "44" }]}>
            {name.trim() ? (
              <Text style={[styles.nameAvatarText, { color: theme.primary }]}>
                {name.trim().charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person-outline" size={16} color={theme.primary} />
            )}
          </View>

          <View style={styles.nameInfo}>
            <Text style={[styles.nameLabel, { color: theme.textSecondary }]}>Display Name</Text>
            {editing ? (
              <TextInput
                ref={inputRef}
                style={[styles.nameInput, { color: theme.text, borderColor: theme.primary + "60" }]}
                value={draft}
                onChangeText={setDraft}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={saveName}
                selectTextOnFocus
              />
            ) : (
              <Text style={[styles.nameValue, { color: theme.text }]}>
                {name.trim() || "Not set"}
              </Text>
            )}
          </View>

          {editing ? (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={cancelEditing} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Ionicons name="close-circle" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={saveName} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={startEditing} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name="pencil-outline" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
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
  nameCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  nameAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  nameAvatarText: {
    fontSize: 16,
    fontWeight: "800",
  },
  nameInfo: {
    flex: 1,
    gap: 2,
  },
  nameLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  nameValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  nameInput: {
    fontSize: 15,
    fontWeight: "600",
    borderBottomWidth: 1.5,
    paddingBottom: 2,
    paddingTop: 0,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
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
