import { useEffect, useReducer, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Socket } from "socket.io-client";
import { createSocket } from "../lib/socket";

type Participant = { socketId: string; name: string };
type Message = { senderName: string; text: string; createdAt: string; isSystem?: boolean };

type RoomState = {
  connected: boolean;
  participants: Participant[];
  videoUrl: string | null;
  videoType: "youtube" | "iframe" | null;
  isPlaying: boolean;
  currentTime: number;
  messages: Message[];
  typingUsers: string[];
  hostName: string | null;
  kicked: boolean;
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
  | { type: "CHAT_HISTORY"; messages: Message[] }
  | { type: "CHAT_RECEIVED"; message: Message }
  | { type: "USER_TYPING"; name: string; isTyping: boolean }
  | { type: "HOST_CHANGED"; hostName: string }
  | { type: "KICKED" };

const initialState: RoomState = {
  connected: false,
  participants: [],
  videoUrl: null,
  videoType: null,
  isPlaying: false,
  currentTime: 0,
  messages: [],
  typingUsers: [],
  hostName: null,
  kicked: false,
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
        videoType: action.videoType as "youtube" | "iframe",
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
        videoType: action.videoType as "youtube" | "iframe",
        isPlaying: action.isPlaying,
        currentTime: action.currentTime,
      };
    case "CHAT_HISTORY":
      return { ...state, messages: action.messages };
    case "CHAT_RECEIVED":
      return { ...state, messages: [...state.messages, action.message] };
    case "USER_TYPING": {
      const filtered = state.typingUsers.filter((n) => n !== action.name);
      return {
        ...state,
        typingUsers: action.isTyping ? [...filtered, action.name] : filtered,
      };
    }
    case "HOST_CHANGED":
      return { ...state, hostName: action.hostName };
    case "KICKED":
      return { ...state, kicked: true };
    default:
      return state;
  }
}

export const useRoomSocket = (roomId: string, name: string) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    socket.on("chat:history", (messages: Message[]) => {
      dispatch({ type: "CHAT_HISTORY", messages });
    });
    socket.on("chat:received", (message: Message) => {
      dispatch({ type: "CHAT_RECEIVED", message });
    });
    socket.on("chat:user-typing", ({ name: userName, isTyping }) => {
      dispatch({ type: "USER_TYPING", name: userName, isTyping });
    });

    socket.on("room:host-changed", ({ hostName }) => {
      dispatch({ type: "HOST_CHANGED", hostName });
    });

    socket.on("room:kicked", () => {
      dispatch({ type: "KICKED" });
      socket.disconnect();
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

  const sendChat = useCallback((text: string) => {
    socketRef.current?.emit("chat:send", { text });
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
    // Update locally immediately so UI responds instantly
    dispatch({ type: "VIDEO_CHANGED", url, videoType });
    // Also emit to server for other participants
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

  return {
    state,
    sendChat,
    sendTyping,
    changeVideo,
    playVideo,
    pauseVideo,
    seekVideo,
    kickUser,
  };
};
