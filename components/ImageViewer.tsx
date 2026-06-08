import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Image,
  Modal,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
};

export default function ImageViewer({ visible, images, initialIndex = 0, onClose }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [current, setCurrent] = useState(initialIndex);
  const [imageErrors, setImageErrors] = useState<boolean[]>([]);

  useEffect(() => {
    if (visible) {
      setCurrent(initialIndex);
      setImageErrors([]);
      // Scroll to initial image without animation after modal is shown
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: initialIndex * W, animated: false });
      }, 80);
    }
  }, [visible, initialIndex, W]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <StatusBar hidden />

        {/* Counter */}
        {images.length > 1 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>{current + 1} / {images.length}</Text>
          </View>
        )}

        {/* Close */}
        <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Image pager */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => {
            setCurrent(Math.round(e.nativeEvent.contentOffset.x / W));
          }}
          style={styles.pager}
        >
          {images.map((uri, i) => (
            <View key={i} style={[styles.page, { width: W, height: H }]}>
              {imageErrors[i] ? (
                <View style={styles.errorPlaceholder}>
                  <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.3)" />
                </View>
              ) : (
                <Image
                  source={{ uri }}
                  style={{ width: W, height: H * 0.82 }}
                  resizeMode="contain"
                  onError={() => setImageErrors((prev) => { const next = [...prev]; next[i] = true; return next; })}
                />
              )}
            </View>
          ))}
        </ScrollView>

        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === current ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  counter: {
    position: "absolute",
    top: 56,
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  counterText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  closeBtn: {
    position: "absolute",
    top: 52,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  pager: {
    flex: 1,
  },
  page: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    position: "absolute",
    bottom: 48,
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: "#fff",
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
