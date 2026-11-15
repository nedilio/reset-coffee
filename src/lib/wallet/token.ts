import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// QR payload: "RC" + client uuid as hex + 32 hex chars of HMAC, all uppercase.
// Only [A-Z0-9] on purpose: USB/Bluetooth scanners "type" the code as a keyboard,
// and punctuation gets remapped under a Spanish layout.
const PREFIX = "RC";
const UUID_HEX = 32;
const SIG_HEX = 32;

function secret(): string {
  const value = process.env.WALLET_SECRET;
  if (!value) throw new Error("WALLET_SECRET is not set");
  return value;
}

const hmac = (purpose: string, id: string) =>
  createHmac("sha256", secret()).update(`${purpose}:${id}`).digest("hex");

const toHex = (uuid: string) => uuid.replace(/-/g, "").toUpperCase();
const toUuid = (hex: string) =>
  hex.toLowerCase().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");

export function signClientToken(clientId: string): string {
  const sig = hmac("qr", clientId).slice(0, SIG_HEX).toUpperCase();
  return `${PREFIX}${toHex(clientId)}${sig}`;
}

// Returns the client id, or null if the code is not ours or was tampered with.
export function verifyClientToken(raw: string): string | null {
  const token = raw.trim().toUpperCase();
  const pattern = new RegExp(`^${PREFIX}([0-9A-F]{${UUID_HEX}})([0-9A-F]{${SIG_HEX}})$`);
  const match = token.match(pattern);
  if (!match) return null;
  const clientId = toUuid(match[1]);
  const expected = Buffer.from(hmac("qr", clientId).slice(0, SIG_HEX).toUpperCase());
  const given = Buffer.from(match[2]);
  return timingSafeEqual(expected, given) ? clientId : null;
}

// Secret Apple sends back as "Authorization: ApplePass <token>" on web service calls.
// Derived instead of stored, so it never needs a column.
export function passAuthToken(clientId: string): string {
  return hmac("pass-auth", clientId);
}

export function verifyPassAuth(header: string | null, clientId: string): boolean {
  const given = header?.replace(/^ApplePass\s+/i, "") ?? "";
  const expected = passAuthToken(clientId);
  return (
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  );
}
