import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

type ReplyTo = {
  messageId: string;
  senderName: string;
  textSnippet: string;
} | null;

type Props = {
  messageId: string;
  senderName: string;
  text: string;
  isSelf: boolean;
  showName: boolean;
  isLastInGroup?: boolean;
  seenCount?: number;
  isDeleted?: boolean;
  editedAt?: string | null;
  replyTo?: ReplyTo;
  isSelected?: boolean;
  onSelect?: (messageId: string | null) => void;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string, currentText: string) => void;
  onDelete?: (messageId: string) => void;
  isHost?: boolean;
};

export default function ChatMessage({
  messageId,
  senderName,
  text,
  isSelf,
  showName,
  isLastInGroup = true,
  seenCount = 0,
  isDeleted = false,
  editedAt = null,
  replyTo = null,
  isSelected = false,
  onSelect,
  onReply,
  onEdit,
  onDelete,
  isHost = false,
}: Props) {
  const { theme } = useTheme();

  const canEdit = isSelf && !isDeleted;
  const canDelete = (isSelf || isHost) && !isDeleted;
  const canReply = !isDeleted;

  const R = 18;
  const TAIL = 4;
  const borderRadius = {
    borderTopLeftRadius: !isSelf && showName ? TAIL : R,
    borderTopRightRadius: isSelf && showName ? TAIL : R,
    borderBottomLeftRadius: !isSelf && !isLastInGroup ? TAIL : R,
    borderBottomRightRadius: isSelf && !isLastInGroup ? TAIL : R,
  };

  if (isDeleted) {
    return (
      <View
        style={[
          styles.row,
          isSelf ? styles.rowEnd : styles.rowStart,
          styles.deletedRow,
        ]}
      >
        <Ionicons
          name="ban-outline"
          size={12}
          color={theme.textSecondary}
          style={{ marginRight: 5 }}
        />
        <Text style={[styles.deletedText, { color: theme.textSecondary }]}>
          This message was deleted
        </Text>
      </View>
    );
  }

  const bubbleBg = isSelf ? theme.chatBubbleSelf : theme.chatBubbleOther;
  const textColor = isSelf ? theme.chatBubbleSelfText : theme.chatBubbleOtherText;
  const replyBg = isSelf ? "rgba(0,0,0,0.12)" : theme.primary + "14";
  const replyBorder = isSelf ? "rgba(0,0,0,0.3)" : theme.primary;
  const replyNameColor = isSelf ? "rgba(0,0,0,0.65)" : theme.primary;
  const replyTextColor = isSelf ? "rgba(0,0,0,0.5)" : theme.textSecondary;

  return (
    <View style={[styles.wrapper, isSelf ? styles.wrapperEnd : styles.wrapperStart]}>

      {/* Sender name */}
      {showName && !isSelf && (
        <Text style={[styles.name, { color: theme.primary }]}>
          {senderName}
        </Text>
      )}

      {/* Action toolbar — above bubble when selected */}
      {isSelected && (canReply || canEdit || canDelete) && (
        <View
          style={[
            styles.toolbar,
            isSelf ? styles.toolbarEnd : styles.toolbarStart,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {canReply && (
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => {
                onSelect?.(null);
                onReply?.(messageId);
              }}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons
                name="arrow-undo-outline"
                size={15}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.toolbarLabel, { color: theme.textSecondary }]}
              >
                Reply
              </Text>
            </TouchableOpacity>
          )}
          {canReply && (canEdit || canDelete) && (
            <View
              style={[styles.toolbarDivider, { backgroundColor: theme.border }]}
            />
          )}
          {canEdit && (
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => {
                onSelect?.(null);
                onEdit?.(messageId, text);
              }}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="pencil-outline" size={15} color={theme.primary} />
              <Text style={[styles.toolbarLabel, { color: theme.primary }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
          {canEdit && canDelete && (
            <View
              style={[styles.toolbarDivider, { backgroundColor: theme.border }]}
            />
          )}
          {canDelete && (
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => {
                onSelect?.(null);
                onDelete?.(messageId);
              }}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="trash-outline" size={15} color={theme.danger} />
              <Text style={[styles.toolbarLabel, { color: theme.danger }]}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Bubble */}
      <TouchableOpacity
        onPress={() => onSelect?.(isSelected ? null : messageId)}
        activeOpacity={0.92}
        style={[
          styles.bubble,
          borderRadius,
          { backgroundColor: bubbleBg },
          isSelected && styles.bubbleSelected,
        ]}
      >
        {/* Reply quote */}
        {replyTo && (
          <View
            style={[
              styles.replyBlock,
              { backgroundColor: replyBg, borderLeftColor: replyBorder },
            ]}
          >
            <Text
              style={[styles.replyName, { color: replyNameColor }]}
              numberOfLines={1}
            >
              {replyTo.senderName}
            </Text>
            <Text
              style={[styles.replySnippet, { color: replyTextColor }]}
              numberOfLines={2}
            >
              {replyTo.textSnippet}
            </Text>
          </View>
        )}

        <Text style={[styles.text, { color: textColor }]}>
          {text}
          {editedAt ? (
            <Text
              style={[
                styles.editedTag,
                {
                  color: isSelf
                    ? "rgba(0,0,0,0.4)"
                    : theme.textSecondary,
                },
              ]}
            >
              {" "}· edited
            </Text>
          ) : null}
        </Text>
      </TouchableOpacity>

      {/* Seen receipt */}
      {isSelf && seenCount > 0 && (
        <View style={styles.seenRow}>
          <Ionicons name="checkmark-done" size={12} color={theme.primary} />
          <Text style={[styles.seenText, { color: theme.textSecondary }]}>
            {seenCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: "78%",
    marginBottom: 2,
  },
  wrapperStart: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
    paddingLeft: 2,
  },
  wrapperEnd: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
    paddingRight: 2,
  },
  name: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 3,
    marginLeft: 4,
    letterSpacing: 0.1,
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
  bubble: {
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  bubbleSelected: {
    opacity: 0.78,
  },
  replyBlock: {
    borderLeftWidth: 2.5,
    paddingLeft: 7,
    paddingVertical: 3,
    paddingRight: 4,
    marginBottom: 6,
    borderRadius: 4,
  },
  replyName: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 1,
  },
  replySnippet: {
    fontSize: 12,
    lineHeight: 15,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  editedTag: {
    fontSize: 11,
  },
  row: {
    marginBottom: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  rowStart: { alignSelf: "flex-start" },
  rowEnd: { alignSelf: "flex-end" },
  deletedRow: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deletedText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  seenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
    marginRight: 4,
  },
  seenText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
