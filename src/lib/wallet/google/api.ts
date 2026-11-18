import "server-only";
import { JWT } from "google-auth-library";
import { serviceAccount } from "./config";

const BASE = "https://walletobjects.googleapis.com/walletobjects/v1";
const SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";

let jwt: JWT | undefined;
const client = () => {
  if (!jwt) {
    const sa = serviceAccount();
    jwt = new JWT({ email: sa.client_email, key: sa.private_key, scopes: [SCOPE] });
  }
  return jwt;
};

type Result = { status: number; data: unknown };

async function call(method: string, path: string, body?: unknown): Promise<Result> {
  const { token } = await client().getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

const fail = (what: string, r: Result) =>
  new Error(`Google Wallet ${what} failed (${r.status}): ${JSON.stringify(r.data)}`);

// Classes rarely change: create once per instance, patch afterwards so edits here reach Google.
let classReady = false;
export async function ensureClass(cls: { id: string }) {
  if (classReady) return;
  const got = await call("GET", `/loyaltyClass/${encodeURIComponent(cls.id)}`);
  const r =
    got.status === 404
      ? await call("POST", "/loyaltyClass", cls)
      : await call("PATCH", `/loyaltyClass/${encodeURIComponent(cls.id)}`, cls);
  if (r.status >= 300) throw fail("class upsert", r);
  classReady = true;
}

export async function upsertObject(obj: { id: string }) {
  const got = await call("GET", `/loyaltyObject/${encodeURIComponent(obj.id)}`);
  const r =
    got.status === 404
      ? await call("POST", "/loyaltyObject", obj)
      : await call("PATCH", `/loyaltyObject/${encodeURIComponent(obj.id)}`, obj);
  if (r.status >= 300) throw fail("object upsert", r);
}

// Returns false when the object does not exist (the customer never saved the pass).
export async function patchObject(obj: { id: string }): Promise<boolean> {
  const r = await call("PATCH", `/loyaltyObject/${encodeURIComponent(obj.id)}`, obj);
  if (r.status === 404) return false;
  if (r.status >= 300) throw fail("object patch", r);
  return true;
}
