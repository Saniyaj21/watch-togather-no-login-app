import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import ImageViewer from "./ImageViewer";

const SCREEN_W = Dimensions.get("window").width;
const COLLAGE_W = Math.min(240, SCREEN_W * 0.62);
const GAP = 2;
const CELL_W = (COLLAGE_W - GAP) / 2;

type BorderRadius = {
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;
};

type Item = { uri: string; messageId: string };

type Props = {
  items: Item[];
  borderRadius: BorderRadius;
  isSelf?: boolean;
  isHost?: boolean;
  onReply?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
};

export default function ImageCollage({ items, borderRadius, isSelf = false, isHost = false, onReply, onDelete }: Props) {
  const { theme } = useTheme();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<boolean[]>([]);

  const open = (i: number) => {
    if (selectedIndex !== null) {
      setSelectedIndex(null);
      return;
    }
    setViewerIndex(i);
    setViewerOpen(true);
  };

  const count = items.length;
  const extra = count > 4 ? count - 3 : 0;

  const hasActions = !!(onReply || onDelete);

  const cell = (index: number, w: number, h: number, extraBr?: Partial<BorderRadius>, showOverlay = false) => {
    const { uri } = items[index];
    const isSelected = selectedIndex === index;
    const hasError = imageErrors[index];
    return (
      <TouchableOpacity
        key={index}
        onPress={() => !hasError && open(index)}
        onLongPress={() => { if (hasActions) setSelectedIndex(index); }}
        delayLongPress={350}
        activeOpacity={0.88}
        style={{ position: "relative" }}
      >
        {hasError ? (
          <View style={[{ width: w, height: h }, extraBr ?? {}, styles.errorPlaceholder]}>
            <Ionicons name="image-outline" size={22} color="rgba(128,128,128,0.5)" />
          </View>
        ) : (
          <Image
            source={{ uri }}
            style={[{ width: w, height: h }, extraBr ?? {}, isSelected ? styles.cellSelected : null]}
            resizeMode="cover"
            onError={() => setImageErrors((prev) => { const next = [...prev]; next[index] = true; return next; })}
          />
        )}
        {showOverlay && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>+{extra}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderGrid = () => {
    if (count === 1) {
      return cell(0, COLLAGE_W, 200, borderRadius);
    }

    if (count === 2) {
      return (
        <View style={styles.row}>
          {cell(0, CELL_W, 160, {
            borderTopLeftRadius: borderRadius.borderTopLeftRadius,
            borderBottomLeftRadius: borderRadius.borderBottomLeftRadius,
          })}
          <View style={styles.gap} />
          {cell(1, CELL_W, 160, {
            borderTopRightRadius: borderRadius.borderTopRightRadius,
            borderBottomRightRadius: borderRadius.borderBottomRightRadius,
          })}
        </View>
      );
    }

    if (count === 3) {
      return (
        <View>
          {cell(0, COLLAGE_W, 140, {
            borderTopLeftRadius: borderRadius.borderTopLeftRadius,
            borderTopRightRadius: borderRadius.borderTopRightRadius,
          })}
          <View style={styles.gap} />
          <View style={styles.row}>
            {cell(1, CELL_W, 110, {
              borderBottomLeftRadius: borderRadius.borderBottomLeftRadius,
            })}
            <View style={styles.gap} />
            {cell(2, CELL_W, 110, {
              borderBottomRightRadius: borderRadius.borderBottomRightRadius,
            })}
          </View>
        </View>
      );
    }

    // 4+ images: 2×2 grid
    return (
      <View>
        <View style={styles.row}>
          {cell(0, CELL_W, 110, {
            borderTopLeftRadius: borderRadius.borderTopLeftRadius,
          })}
          <View style={styles.gap} />
          {cell(1, CELL_W, 110, {
            borderTopRightRadius: borderRadius.borderTopRightRadius,
          })}
        </View>
        <View style={styles.gap} />
        <View style={styles.row}>
          {cell(2, CELL_W, 110, {
            borderBottomLeftRadius: borderRadius.borderBottomLeftRadius,
          })}
          <View style={styles.gap} />
          {cell(
            3,
            CELL_W,
            110,
            { borderBottomRightRadius: borderRadius.borderBottomRightRadius },
            extra > 0
          )}
        </View>
      </View>
    );
  };

  const canReply = !!onReply;
  const canDelete = !!(onDelete && (isSelf || isHost));
  const showToolbar = selectedIndex !== null && (canReply || canDelete);

  return (
    <>
      {showToolbar && (
        <View
          style={[
            styles.toolbar,
            isSelf ? styles.toolbarEnd : styles.toolbarStart,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {canReply && (
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => {
                onReply!(items[selectedIndex!].messageId);
                setSelectedIndex(null);
              }}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="arrow-undo-outline" size={15} color={theme.textSecondary} />
              <Text style={[styles.toolbarLabel, { color: theme.textSecondary }]}>Reply</Text>
            </TouchableOpacity>
          )}
          {canReply && canDelete && (
            <View style={[styles.toolbarDivider, { backgroundColor: theme.border }]} />
          )}
          {canDelete && (
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => {
                onDelete!(items[selectedIndex!].messageId);
                setSelectedIndex(null);
              }}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="trash-outline" size={15} color={theme.danger} />
              <Text style={[styles.toolbarLabel, { color: theme.danger }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={[styles.container, { width: COLLAGE_W, ...borderRadius }]}>
        {renderGrid()}
      </View>

      <ImageViewer
        visible={viewerOpen}
        images={items.map((i) => i.uri)}
        initialIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  gap: {
    width: GAP,
    height: GAP,
  },
  cellSelected: {
    opacity: 0.72,
  },
  errorPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(128,128,128,0.1)",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 3,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  toolbarStart: { alignSelf: "flex-start" },
  toolbarEnd: { alignSelf: "flex-end" },
  toolbarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  toolbarLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  toolbarDivider: {
    width: 1,
    height: 16,
    borderRadius: 1,
  },
});
