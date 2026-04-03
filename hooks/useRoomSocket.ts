import { useEffect, useReducer, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Socket } from "socket.io-client";
import { createSocket } from "../lib/socket";

type Participant = { socketId: string; name: string };

type ReplyTo = {
  messageId: string;
  senderName: string;
  textSnippet: string;
} | null;

type Message = {
  _id: string;
  senderName: string;
  text: string;
  createdAt: string;
  isSystem?: boolean;
  isDeleted?: boolean;
  editedAt?: string | null;
  replyTo?: ReplyTo;
};

type SeenEntry = { name: string; lastSeenAt: string };

type QueueItem = {
  url: string;
  videoType: "youtube" | "direct" | "iframe";
  addedBy: string;
  addedAt?: string;
};

type RoomState = {
  connected: boolean;
  participants: Participant[];
  videoUrl: string | null;
  videoType: "youtube" | "direct" | "iframe" | null;
  isPlaying: boolean;
  currentTime: number;
  messages: Message[];
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  typingUsers: string[];
  seenData: SeenEntry[];
  hostName: string | null;
  kicked: boolean;
  queue: QueueItem[];
  currentQueueIndex: number;
};

type Action =
  | { type: "CONNECTED" }
  | { type: "DISCONNECTED" }
  | { type: "SET_PARTICIPANTS"; participants: Participant[] }
  | { type: "VIDEO_CHANGED"; url: string; videoType: string }
  | { type: "VIDEO_PLAYED"; currentTime: number }
  | { type: "VIDEO_PAUSED"; currentTime: number }
  | { type: "VIDEO_SEEKED"; currentTime: number }
  | {
      type: "VIDEO_STATE";
      url: string;
      videoType: string;
      isPlaying: boolean;
      currentTime: number;
    }
  | { type: "CHAT_HISTORY"; messages: Message[]; hasMore: boolean }
  | { type: "CHAT_HISTORY_PREPEND"; messages: Message[]; hasMore: boolean }
  | { type: "CHAT_LOADING_MORE" }
  | { type: "CHAT_RECEIVED"; message: Message }
  | { type: "MESSAGE_EDITED"; messageId: string; newText: string; editedAt: string }
  | { type: "MESSAGE_DELETED"; messageId: string }
  | { type: "USER_TYPING"; name: string; isTyping: boolean }
  | { type: "SEEN_UPDATE"; seenData: SeenEntry[] }
  | { type: "HOST_CHANGED"; hostName: string }
  | { type: "KICKED" }
  | { type: "QUEUE_STATE"; queue: QueueItem[]; currentQueueIndex: number }
  | { type: "QUEUE_UPDATED"; queue: QueueItem[] }
  | { type: "QUEUE_INDEX_CHANGED"; index: number; url: string; videoType: string };

const initialState: RoomState = {
  connected: false,
  participants: [],
  videoUrl: null,
  videoType: null,
  isPlaying: false,
  currentTime: 0,
  messages: [],
  hasMoreMessages: false,
  isLoadingMore: false,
  typingUsers: [],
  seenData: [],
  hostName: null,
  kicked: false,
  queue: [],
  currentQueueIndex: -1,
};

function reducer(state: RoomState, action: Action): RoomState {
  switch (action.type) {
    case "CONNECTED":
      return { ...state, connected: true };
    case "DISCONNECTED":
      return { ...state, connected: false };
    case "SET_PARTICIPANTS":
      return { ...state, participants: action.participants };
    case "VIDEO_CHANGED":
      return {
        ...state,
        videoUrl: action.url,
        videoType: action.videoType as "youtube" | "direct" | "iframe",
        isPlaying: false,
        currentTime: 0,
      };
    case "VIDEO_PLAYED":
      return { ...state, isPlaying: true, currentTime: action.currentTime };
    case "VIDEO_PAUSED":
      return { ...state, isPlaying: false, currentTime: action.currentTime };
    case "VIDEO_SEEKED":
      return { ...state, currentTime: action.currentTime };
    case "VIDEO_STATE":
      return {
        ...state,
        videoUrl: action.url,
        videoType: action.videoType as "youtube" | "direct" | "iframe",
        isPlaying: action.isPlaying,
        currentTime: action.currentTime,
      };
    case "CHAT_HISTORY":
      return {
        ...state,
        messages: action.messages,
        hasMoreMessages: action.hasMore,
        isLoadingMore: false,
      };
    case "CHAT_LOADING_MORE":
      return { ...state, isLoadingMore: true };
    case "CHAT_HISTORY_PREPEND":
      return {
        ...state,
        messages: [...action.messages, ...state.messages],
        hasMoreMessages: action.hasMore,
        isLoadingMore: false,
      };
    case "CHAT_RECEIVED":
      return { ...state, messages: [...state.messages, action.message] };
    case "MESSAGE_EDITED":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m._id === action.messageId
            ? { ...m, text: action.newText, editedAt: action.editedAt }
            : m
        ),
      };
    case "MESSAGE_DELETED":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m._id === action.messageId ? { ...m, isDeleted: true, text: "" } : m
        ),
      };
    case "USER_TYPING": {
      const filtered = state.typingUsers.filter((n) => n !== action.name);
      return {
        ...state,
        typingUsers: action.isTyping ? [...filtered, action.name] : filtered,
      };
    }
    case "SEEN_UPDATE":
      return { ...state, seenData: action.seenData };
    case "HOST_CHANGED":
      return { ...state, hostName: action.hostName };
    case "KICKED":
      return { ...state, kicked: true };
    case "QUEUE_STATE":
      return {
        ...state,
        queue: action.queue,
        currentQueueIndex: action.currentQueueIndex,
      };
    case "QUEUE_UPDATED":
      return { ...state, queue: action.queue };
    case "QUEUE_INDEX_CHANGED":
      return {
        ...state,
        currentQueueIndex: action.index,
        videoUrl: action.url,
        videoType: action.videoType as "youtube" | "direct" | "iframe",
        isPlaying: false,
        currentTime: 0,
      };
    default:
      return state;
  }
}

export const useRoomSocket = (roomId: string, name: string) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep stable refs for loadMoreMessages to avoid stale closure issues
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    console.log("[Socket] Connecting to room:", roomId, "as:", name);
    const socket = createSocket(roomId, name);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected! id:", socket.id);
      dispatch({ type: "CONNECTED" });
    });

    socket.on("connect_error", (err) => {
      console.log("[Socket] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      dispatch({ type: "DISCONNECTED" });
    });

    socket.on("room:participant-joined", ({ name: joinedName, participants, hostName }) => {
      dispatch({ type: "SET_PARTICIPANTS", participants });
      if (hostName) dispatch({ type: "HOST_CHANGED", hostName });
      dispatch({
        type: "CHAT_RECEIVED",
        message: {
          _id: `system-${Date.now()}-join`,
          senderName: "__system__",
          text: `${joinedName} joined`,
          createdAt: new Date().toISOString(),
          isSystem: true,
        },
      });
    });

    socket.on("room:participant-left", ({ name: leftName, participants }) => {
      dispatch({ type: "SET_PARTICIPANTS", participants });
      dispatch({
        type: "CHAT_RECEIVED",
        message: {
          _id: `system-${Date.now()}-left`,
          senderName: "__system__",
          text: `${leftName} left`,
          createdAt: new Date().toISOString(),
          isSystem: true,
        },
      });
    });

    socket.on("video:changed", ({ url, videoType }) => {
      console.log("[Socket] video:changed received:", url);
      dispatch({ type: "VIDEO_CHANGED", url, videoType });
    });
    socket.on("video:played", ({ currentTime }) => {
      dispatch({ type: "VIDEO_PLAYED", currentTime });
    });
    socket.on("video:paused", ({ currentTime }) => {
      dispatch({ type: "VIDEO_PAUSED", currentTime });
    });
    socket.on("video:seeked", ({ currentTime }) => {
      dispatch({ type: "VIDEO_SEEKED", currentTime });
    });
    socket.on("video:state", ({ url, videoType, isPlaying, currentTime }) => {
      dispatch({ type: "VIDEO_STATE", url, videoType, isPlaying, currentTime });
    });

    // chat:history is now { messages, hasMore } shape
    socket.on("chat:history", ({ messages, hasMore }: { messages: Message[]; hasMore: boolean }) => {
      dispatch({ type: "CHAT_HISTORY", messages, hasMore });
    });
    socket.on("chat:received", (message: Message) => {
      dispatch({ type: "CHAT_RECEIVED", message });
    });
    socket.on("chat:user-typing", ({ name: userName, isTyping }) => {
      dispatch({ type: "USER_TYPING", name: userName, isTyping });
    });
    socket.on("chat:seen-update", ({ seenData }: { seenData: SeenEntry[] }) => {
      dispatch({ type: "SEEN_UPDATE", seenData });
    });
    socket.on("chat:message-edited", ({ messageId, newText, editedAt }) => {
      dispatch({ type: "MESSAGE_EDITED", messageId, newText, editedAt });
    });
    socket.on("chat:message-deleted", ({ messageId }) => {
      dispatch({ type: "MESSAGE_DELETED", messageId });
    });

    socket.on("room:host-changed", ({ hostName }) => {
      dispatch({ type: "HOST_CHANGED", hostName });
    });

    socket.on("room:kicked", () => {
      dispatch({ type: "KICKED" });
      socket.disconnect();
    });

    // Queue listeners
    socket.on("queue:state", ({ queue, currentQueueIndex }) => {
      dispatch({ type: "QUEUE_STATE", queue, currentQueueIndex });
    });
    socket.on("queue:updated", ({ queue }) => {
      dispatch({ type: "QUEUE_UPDATED", queue });
    });
    socket.on("queue:index-changed", ({ index, url, videoType }) => {
      dispatch({ type: "QUEUE_INDEX_CHANGED", index, url, videoType });
    });
    socket.on("queue:exhausted", () => {
      // Queue ended — keep current video state, just reset index via a no-op QUEUE_STATE
      dispatch({
        type: "QUEUE_STATE",
        queue: stateRef.current.queue,
        currentQueueIndex: -1,
      });
    });

    // Handle app going to background/foreground
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        console.log("[Socket] App foregrounded, reconnecting...");
        if (!socket.connected) {
          socket.connect();
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppState);

    return () => {
      subscription.remove();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, name]);

  const sendChat = useCallback((text: string, replyToMessageId?: string) => {
    socketRef.current?.emit("chat:send", { text, replyToMessageId });
    socketRef.current?.emit("chat:typing", { isTyping: false });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  const sendTyping = useCallback(() => {
    socketRef.current?.emit("chat:typing", { isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("chat:typing", { isTyping: false });
    }, 2000);
  }, []);

  const changeVideo = useCallback((url: string, videoType: string) => {
    console.log("[Socket] Emitting video:change", url, "connected:", socketRef.current?.connected);
    dispatch({ type: "VIDEO_CHANGED", url, videoType });
    socketRef.current?.emit("video:change", { url, videoType });
  }, []);

  const playVideo = useCallback((currentTime: number) => {
    socketRef.current?.emit("video:play", { currentTime });
  }, []);

  const pauseVideo = useCallback((currentTime: number) => {
    socketRef.current?.emit("video:pause", { currentTime });
  }, []);

  const seekVideo = useCallback((currentTime: number) => {
    socketRef.current?.emit("video:seek", { currentTime });
  }, []);

  const kickUser = useCallback((socketId: string) => {
    socketRef.current?.emit("room:kick", { socketId });
  }, []);

  const markSeen = useCallback((lastSeenAt: string) => {
    socketRef.current?.emit("chat:seen", { lastSeenAt });
  }, []);

  const editMessage = useCallback((messageId: string, newText: string) => {
    socketRef.current?.emit("chat:edit", { messageId, newText });
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    socketRef.current?.emit("chat:delete", { messageId });
  }, []);

  const loadMoreMessages = useCallback(() => {
    const current = stateRef.current;
    if (current.isLoadingMore || !current.hasMoreMessages) return;

    // Find oldest non-system message
    const oldest = current.messages.find((m) => !m.isSystem);
    if (!oldest) return;

    dispatch({ type: "CHAT_LOADING_MORE" });

    socketRef.current?.emit(
      "chat:load-more",
      { beforeCreatedAt: oldest.createdAt },
      (response: { messages: Message[]; hasMore: boolean }) => {
        dispatch({
          type: "CHAT_HISTORY_PREPEND",
          messages: response.messages,
          hasMore: response.hasMore,
        });
      }
    );
  }, []);

  // Queue callbacks
  const addToQueue = useCallback((url: string, videoType: string) => {
    socketRef.current?.emit("queue:add", { url, videoType });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    socketRef.current?.emit("queue:remove", { index });
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    socketRef.current?.emit("queue:reorder", { fromIndex, toIndex });
  }, []);

  const playQueueIndex = useCallback((index: number) => {
    socketRef.current?.emit("queue:play-index", { index });
  }, []);

  const advanceQueue = useCallback(() => {
    socketRef.current?.emit("queue:advance");
  }, []);

  return {
    state,
    sendChat,
    sendTyping,
    changeVideo,
    playVideo,
    pauseVideo,
    seekVideo,
    kickUser,
    markSeen,
    editMessage,
    deleteMessage,
    loadMoreMessages,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    playQueueIndex,
    advanceQueue,
  };
};
