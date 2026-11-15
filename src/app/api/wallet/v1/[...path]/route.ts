import { NextRequest } from "next/server";
import { captureServerEvent } from "@/actions/ph-client";
import { getClientById } from "@/clients";
import { TABLE_NAME } from "@/lib/constants";
import { passTypeId, walletEnabled } from "@/lib/wallet/config";
import { buildPass, PKPASS_HEADERS } from "@/lib/wallet/pass";
import { verifyPassAuth } from "@/lib/wallet/token";
import { createClient } from "@/supabase-server";

// Apple PassKit web service (webServiceURL = <base>/api/wallet, Apple appends /v1/...):
//   POST   devices/{device}/registrations/{passType}/{serial}   register for pushes
//   DELETE devices/{device}/registrations/{passType}/{serial}   unregister
//   GET    devices/{device}/registrations/{passType}            serials changed since a tag
//   GET    passes/{passType}/{serial}                           latest .pkpass
//   POST   log                                                  device-side errors
// Called by iOS without a session: auth is the per-pass "ApplePass <token>" header.

type Ctx = { params: Promise<{ path: string[] }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const empty = (status: number) => new Response(null, { status });

// Pass ids must be ours and serials must be client uuids before touching the DB.
const validPass = (passType: string, serial?: string) =>
  passType === passTypeId() && (serial === undefined || UUID.test(serial));

// Wallet funnel events: the web service only knows the serial, so look the customer's email up.
async function trackWallet(serial: string, event: string, hasPass: boolean) {
  const client = await getClientById(serial);
  if (!client?.email) return;
  captureServerEvent({
    distinctId: client.email,
    event,
    properties: { coffees: client.coffees },
    set: { has_wallet_pass: hasPass },
  });
}

async function register(req: NextRequest, device: string, serial: string) {
  if (!verifyPassAuth(req.headers.get("authorization"), serial)) return empty(401);
  const body = (await req.json().catch(() => null)) as { pushToken?: string } | null;
  if (!body?.pushToken) return empty(400);

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("wallet_registrations")
    .select("serial_number")
    .eq("device_library_id", device)
    .eq("serial_number", serial)
    .maybeSingle();
  const { error } = await supabase.from("wallet_registrations").upsert({
    device_library_id: device,
    serial_number: serial,
    push_token: body.pushToken,
  });
  if (error) {
    // FK violation = the client no longer exists (deleted by an admin).
    console.error("Wallet register error:", error);
    return empty(error.code === "23503" ? 401 : 500);
  }
  // 201 = first time this device registers the pass, i.e. the customer really added it to Wallet.
  if (!existing) await trackWallet(serial, "wallet_pass_installed", true);
  return empty(existing ? 200 : 201);
}

async function unregister(req: NextRequest, device: string, serial: string) {
  if (!verifyPassAuth(req.headers.get("authorization"), serial)) return empty(401);
  const supabase = await createClient();
  await supabase
    .from("wallet_registrations")
    .delete()
    .eq("device_library_id", device)
    .eq("serial_number", serial);
  await trackWallet(serial, "wallet_pass_removed", false);
  return empty(200);
}

async function changedSerials(req: NextRequest, device: string) {
  const since = req.nextUrl.searchParams.get("passesUpdatedSince");
  const supabase = await createClient();
  const { data: regs } = await supabase
    .from("wallet_registrations")
    .select("serial_number")
    .eq("device_library_id", device);
  const serials = (regs ?? []).map((r) => r.serial_number);
  if (serials.length === 0) return empty(204);

  let query = supabase.from(TABLE_NAME).select("id, updated_at").in("id", serials);
  if (since && !Number.isNaN(Date.parse(since))) query = query.gt("updated_at", since);
  const { data: changed } = await query;
  if (!changed?.length) return empty(204);

  const lastUpdated = changed.reduce(
    (max, c) => (c.updated_at > max ? c.updated_at : max),
    changed[0].updated_at
  );
  return Response.json({ serialNumbers: changed.map((c) => c.id), lastUpdated });
}

async function latestPass(req: NextRequest, serial: string) {
  if (!verifyPassAuth(req.headers.get("authorization"), serial)) return empty(401);
  const client = await getClientById(serial);
  if (!client) return empty(404);

  // No 304 on If-Modified-Since: HTTP dates have second precision, so two changes within the
  // same second would leave the device on a stale pass. Apple only asks after a push anyway.
  const modified = new Date(client.updated_at);
  const pass = await buildPass(client);
  return new Response(new Uint8Array(pass), {
    headers: { ...PKPASS_HEADERS, "Last-Modified": modified.toUTCString() },
  });
}

async function handle(req: NextRequest, { params }: Ctx) {
  if (!walletEnabled()) return empty(503);
  const path = (await params).path;
  const [root, a, b, c, d] = path;

  if (root === "log" && req.method === "POST") {
    const body = await req.json().catch(() => null);
    console.error("Wallet device log:", JSON.stringify(body));
    return empty(200);
  }

  if (root === "devices" && b === "registrations") {
    const device = a;
    if (!device || !validPass(c, d)) return empty(404);
    if (d && req.method === "POST") return register(req, device, d);
    if (d && req.method === "DELETE") return unregister(req, device, d);
    if (!d && req.method === "GET") return changedSerials(req, device);
  }

  if (root === "passes" && req.method === "GET" && path.length === 3) {
    if (!validPass(a, b)) return empty(404);
    return latestPass(req, b);
  }

  return empty(404);
}

export { handle as GET, handle as POST, handle as DELETE };
