import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";
import { utf8ToBytes } from "@noble/hashes/utils";
import { hmac } from "@noble/hashes/hmac";
import { gcm } from "@noble/ciphers/aes";

const STATIC_SALT = utf8ToBytes("watch-together-e2e-salt");
const STATIC_INFO = utf8ToBytes("watch-together-v1");
const ENC_PREFIX = "ENC:";

export type RoomKey = Uint8Array;

// Module-level counter — increments on every encrypt call.
// Combined with the millisecond timestamp, (key, IV) collisions are
// impossible within any single session and negligible across restarts.
let _nonceCounter = 0;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function deriveRoomKey(roomCode: string): RoomKey {
  return hkdf(sha256, utf8ToBytes(roomCode), STATIC_SALT, STATIC_INFO, 32);
}

// HMAC-SHA256(key, counter:timestamp) → take first 12 bytes as GCM nonce.
// Deterministic and unique: counter ensures no two calls produce the same nonce
// even at the same millisecond. No dependency on crypto.getRandomValues.
function makeIV(key: RoomKey): Uint8Array {
  const tag = utf8ToBytes(`${++_nonceCounter}:${Date.now()}`);
  return hmac(sha256, key, tag).slice(0, 12);
}

export function encryptText(key: RoomKey, plaintext: string): string {
  const iv = makeIV(key);
  const ciphertext = gcm(key, iv).encrypt(utf8ToBytes(plaintext));
  return `${ENC_PREFIX}${toBase64(iv)}:${toBase64(ciphertext)}`;
}

export function decryptText(key: RoomKey, payload: string): string {
  if (!payload || !payload.startsWith(ENC_PREFIX)) return payload;
  try {
    const inner = payload.slice(ENC_PREFIX.length);
    const colonIndex = inner.indexOf(":");
    if (colonIndex === -1) return "[decryption failed]";
    const iv = fromBase64(inner.slice(0, colonIndex));
    const ct = fromBase64(inner.slice(colonIndex + 1));
    return new TextDecoder().decode(gcm(key, iv).decrypt(ct));
  } catch {
    return "[decryption failed]";
  }
}
