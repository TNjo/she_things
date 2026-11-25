import { randomBytes, randomUUID } from "crypto";

export const newId = (prefix: string) => `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
export const newToken = (bytes = 24) => randomBytes(bytes).toString("base64url");

export function newOrderNumber(): string {
  // Avoid ambiguous chars (0/O, 1/I)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = randomBytes(6);
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[b[i] % alphabet.length];
  return `ST-${s}`;
}
