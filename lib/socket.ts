import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "../constants/config";

export const createSocket = (roomId: string, name: string): Socket => {
  return io(SERVER_URL, {
    query: { roomId, name },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
};
