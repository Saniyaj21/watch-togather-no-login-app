import React, { createContext, useContext } from "react";
import { useRoomSocket } from "../hooks/useRoomSocket";

type RoomContextType = ReturnType<typeof useRoomSocket>;

const RoomContext = createContext<RoomContextType | null>(null);

export const RoomProvider: React.FC<{
  roomId: string;
  name: string;
  children: React.ReactNode;
}> = ({ roomId, name, children }) => {
  const roomSocket = useRoomSocket(roomId, name);

  return (
    <RoomContext.Provider value={roomSocket}>{children}</RoomContext.Provider>
  );
};

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
};
