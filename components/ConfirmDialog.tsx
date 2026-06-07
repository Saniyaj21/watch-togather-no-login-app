import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  icon,
  onConfirm,
  onCancel,
}: Props) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 140,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const accentColor = destructive ? theme.danger : theme.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim, backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              {/* Icon */}
              {icon && (
                <View style={[styles.iconWrap, { backgroundColor: accentColor + "18", borderColor: accentColor + "30" }]}>
                  <Ionicons name={icon as any} size={26} color={accentColor} />
                </View>
              )}

              {/* Text */}
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              {/* Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={onCancel}
                  activeOpacity={0.7}
                  style={[styles.btn, styles.cancelBtn, { borderColor: theme.border, backgroundColor: theme.surface2 }]}
                >
                  <Text style={[styles.cancelText, { color: theme.textSecondary }]}>{cancelLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  activeOpacity={0.8}
                  style={[styles.btn, styles.confirmBtn, { backgroundColor: accentColor }]}
                >
                  <Text style={[styles.confirmText, { color: "#fff" }]}>{confirmLabel}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },
  divider: {
    width: "100%",
    height: 1,
    marginTop: 24,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    borderWidth: 1.5,
  },
  confirmBtn: {},
  cancelText: {
    fontSize: 15,
    fontWeight: "700",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "800",
  },
});
