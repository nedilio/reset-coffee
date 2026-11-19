import "server-only";
import { createSign } from "node:crypto";
import { publicBase, serviceAccount } from "./config";

const b64url = (input: string | Buffer) => Buffer.from(input).toString("base64url");

// "Add to Google Wallet" link. Skinny JWT: it only references the object we already created
// over REST, so it stays far below the 1800 characters browsers may truncate.
export function saveUrl(objectId: string): string {
  const sa = serviceAccount();
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: sa.client_email,
      aud: "google",
      typ: "savetowallet",
      iat: Math.floor(Date.now() / 1000),
      origins: [publicBase()],
      payload: { loyaltyObjects: [{ id: objectId }] },
    })
  );
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${payload}`)
    .sign(sa.private_key);
  return `https://pay.google.com/gp/v/save/${header}.${payload}.${b64url(signature)}`;
}
