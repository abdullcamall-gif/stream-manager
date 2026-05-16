import crypto from "node:crypto";

const ALGO = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const raw = process.env.STREAM_CREDENTIALS_KEY?.trim();
  if (!raw) {
    throw new Error("Missing STREAM_CREDENTIALS_KEY");
  }

  const isHex = /^[0-9a-fA-F]{64}$/.test(raw);
  if (isHex) return Buffer.from(raw, "hex");

  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("STREAM_CREDENTIALS_KEY must be 32 bytes (base64) or 64 hex chars");
  }
  return key;
}

export function encryptField(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptField(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted payload format");
  }
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function maybeDecryptField(value: string | null | undefined): string {
  if (!value) return "";
  try {
    if (value.split(".").length === 3) {
      return decryptField(value);
    }
    return value;
  } catch {
    return value;
  }
}
