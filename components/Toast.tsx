import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ToastType = "success" | "error" | "info";

interface ToastOptions {
  type?: ToastType;
  text1: string;
  text2?: string;
  duration?: number;
  onHide?: () => void;
}

export interface ToastRef {
  show: (opts: ToastOptions) => void;
}

const ICONS: Record<ToastType, { name: "checkmark-circle" | "close-circle" | "information-circle"; color: string }> = {
  success: { name: "checkmark-circle", color: "#22c55e" },
  error: { name: "close-circle", color: "#ef4444" },
  info: { name: "information-circle", color: "#3b82f6" },
};

const ToastComponent = forwardRef<ToastRef>((_, ref) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onHideRef = useRef<(() => void) | undefined>(undefined);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setToast(null);
      onHideRef.current?.();
      onHideRef.current = undefined;
    });
  };

  useImperativeHandle(ref, () => ({
    show(opts: ToastOptions) {
      if (timerRef.current) clearTimeout(timerRef.current);
      onHideRef.current = opts.onHide;
      setToast(opts);
      opacity.setValue(0);
      translateY.setValue(-20);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(hide, opts.duration ?? 3000);
    },
  }));

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (!toast) return null;

  const { name, color } = ICONS[toast.type ?? "info"];

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <Ionicons name={name} size={20} color={color} style={styles.icon} />
      <View style={styles.textWrap}>
        <Text style={styles.text1} numberOfLines={1}>{toast.text1}</Text>
        {toast.text2 ? <Text style={styles.text2} numberOfLines={2}>{toast.text2}</Text> : null}
      </View>
    </Animated.View>
  );
});

ToastComponent.displayName = "Toast";

// Singleton ref so Toast.show() can be called from anywhere
const toastRef = React.createRef<ToastRef>();

export const Toast = {
  Component: () => <ToastComponent ref={toastRef} />,
  show: (opts: ToastOptions) => toastRef.current?.show(opts),
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: { marginRight: 10 },
  textWrap: { flex: 1 },
  text1: { color: "#fff", fontWeight: "700", fontSize: 14 },
  text2: { color: "#aaa", fontSize: 12, marginTop: 2 },
});
