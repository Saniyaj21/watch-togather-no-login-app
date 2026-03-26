import { SERVER_URL } from "../constants/config";

export const createRoom = async (hostName: string) => {
  const res = await fetch(`${SERVER_URL}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hostName }),
  });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json() as Promise<{ roomId: string }>;
};

export const joinRoom = async (roomId: string, name: string) => {
  const res = await fetch(`${SERVER_URL}/api/rooms/${roomId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Room not found");
    throw new Error("Failed to join room");
  }
  return res.json();
};

export const getRoom = async (roomId: string) => {
  const res = await fetch(`${SERVER_URL}/api/rooms/${roomId}`);
  if (!res.ok) throw new Error("Room not found");
  return res.json();
};
