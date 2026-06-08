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

export const uploadImage = async (uri: string, mimeType?: string): Promise<string> => {
  const form = new FormData();
  const filename = uri.split("/").pop() ?? "image.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const fallbackMime = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";
  const mime = mimeType ?? fallbackMime;
  form.append("image", { uri, name: filename, type: mime } as any);

  const res = await fetch(`${SERVER_URL}/api/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.url as string;
};
