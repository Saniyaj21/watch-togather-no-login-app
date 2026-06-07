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
import { useTheme, ThemeMode } from "../contexts/ThemeContext";
import { ACCENT_COLORS, AccentId } from "../constants/theme";

const MODE_OPTIONS: { mode: ThemeMode; label: string; icon: string; desc: string }[] = [
  { mode: "system", label: "System", icon: "phone-portrait-outline", desc: "Follows device setting" },
  { mode: "light", label: "Light", icon: "sunny-outline", desc: "Always light" },
  { mode: "dark", label: "Dark", icon: "moon-outline", desc: "Always dark" },
];

export default function ThemeSettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode, accentId, setAccentId } = useTheme();

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Theme</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mode section */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {MODE_OPTIONS.map(({ mode, label, icon, desc }, i) => {
            const selected = themeMode === mode;
            return (
              <React.Fragment key={mode}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                <TouchableOpacity
                  style={styles.modeRow}
                  activeOpacity={0.7}
                  onPress={() => setThemeMode(mode)}
                >
                  <View style={[styles.modeIcon, { backgroundColor: selected ? theme.primaryMuted : theme.surface2 }]}>
                    <Ionicons name={icon as any} size={18} color={selected ? theme.primary : theme.textSecondary} />
                  </View>
                  <View style={styles.modeText}>
                    <Text style={[styles.modeLabel, { color: selected ? theme.primary : theme.text }, selected && styles.modeLabelSelected]}>
                      {label}
                    </Text>
                    <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>{desc}</Text>
                  </View>
                  <View style={[
                    styles.radio,
                    { borderColor: selected ? theme.primary : theme.border },
                    selected && { backgroundColor: theme.primary },
                  ]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* Accent color section */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ACCENT COLOR</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.colorGrid}>
            {ACCENT_COLORS.map((accent) => {
              const selected = accentId === accent.id;
              const color = accent.lightPrimary;
              return (
                <TouchableOpacity
                  key={accent.id}
                  style={styles.colorItem}
                  activeOpacity={0.75}
                  onPress={() => setAccentId(accent.id as AccentId)}
                >
                  <View style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    selected && styles.colorSwatchSelected,
                  ]}>
                    {selected && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={[
                    styles.colorLabel,
                    { color: selected ? theme.primary : theme.textSecondary },
                    selected && styles.colorLabelSelected,
                  ]}>
                    {accent.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preview */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>PREVIEW</Text>
        <View style={[styles.card, styles.previewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.previewRow}>
            <View style={[styles.previewBubbleOther, { backgroundColor: theme.chatBubbleOther }]}>
              <Text style={[styles.previewText, { color: theme.chatBubbleOtherText }]}>Hey, what are we watching?</Text>
            </View>
          </View>
          <View style={[styles.previewRow, styles.previewRowSelf]}>
            <View style={[styles.previewBubbleSelf, { backgroundColor: theme.chatBubbleSelf }]}>
              <Text style={[styles.previewText, { color: theme.chatBubbleSelfText }]}>Something good, trust me!</Text>
            </View>
          </View>
          <View style={styles.previewActions}>
            <View style={[styles.previewBtn, { backgroundColor: theme.primary }]}>
              <Text style={[styles.previewBtnText, { color: theme.chatBubbleSelfText }]}>Primary</Text>
            </View>
            <View style={[styles.previewBtn, { backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border }]}>
              <Text style={[styles.previewBtnText, { color: theme.text }]}>Secondary</Text>
            </View>
          </View>
        </View>
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
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  modeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modeText: { flex: 1 },
  modeLabel: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  modeLabelSelected: { fontWeight: "700" },
  modeDesc: { fontSize: 12 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
  },
  colorItem: {
    alignItems: "center",
    gap: 6,
    width: 56,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchSelected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  colorLabel: { fontSize: 11, fontWeight: "500" },
  colorLabelSelected: { fontWeight: "700" },
  previewCard: { padding: 16 },
  previewRow: { marginBottom: 10 },
  previewRowSelf: { alignItems: "flex-end" },
  previewBubbleOther: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    maxWidth: "75%",
  },
  previewBubbleSelf: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderTopRightRadius: 4,
    maxWidth: "75%",
  },
  previewText: { fontSize: 13, lineHeight: 18 },
  previewActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  previewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  previewBtnText: { fontSize: 13, fontWeight: "600" },
});
