import "server-only";
import { connect } from "node:http2";
import { after } from "next/server";
import { createClient } from "@/supabase-server";
import { certificates, passTypeId, walletEnabled, webServiceBase } from "./config";

const APNS_HOST = "https://api.push.apple.com";

// Same headers the passkit-generator author's hapns uses for pass updates: push type "alert"
// with an empty payload (Wallet itself decides whether to show a notification).
const pushHeaders = (token: string) => ({
  ":method": "POST",
  ":path": `/3/device/${token}`,
  "apns-topic": passTypeId(),
  "apns-push-type": "alert",
  "content-type": "application/json",
});

// Wallet pushes are empty: they only tell the device "ask the web service for this pass again".
// Authenticated with the Pass Type ID certificate itself (TLS client cert), topic = pass type id.
function pushAll(tokens: string[]): Promise<{ token: string; status: number }[]> {
  const { signerCert, signerKey, signerKeyPassphrase } = certificates();
  const session = connect(APNS_HOST, {
    cert: signerCert,
    key: signerKey,
    passphrase: signerKeyPassphrase,
  });
  session.on("error", (err) => console.error("APNs session error:", err));

  const sends = tokens.map(
    (token) =>
      new Promise<{ token: string; status: number }>((resolve) => {
        let status = 0;
        let body = "";
        let done = false;
        // close/error/timeout can each fire; settle once so Promise.all (and after()) never hangs.
        const finish = () => {
          if (done) return;
          done = true;
          if (status !== 200) console.error(`APNs ${status || "no response"} for pass push:`, body);
          resolve({ token, status });
        };
        const req = session.request(pushHeaders(token));
        req.setEncoding("utf8");
        req.on("response", (headers) => (status = Number(headers[":status"])));
        req.on("data", (chunk) => (body += chunk));
        req.on("end", finish);
        req.on("close", finish);
        req.on("error", (err) => {
          console.error("APNs request error:", err);
          finish();
        });
        req.setTimeout(8000, () => req.close());
        req.end("{}");
      })
  );

  return Promise.all(sends).finally(() => session.close());
}

async function notify(serialNumber: string) {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("wallet_registrations")
    .select("push_token")
    .eq("serial_number", serialNumber);
  if (error) {
    console.error("Error reading wallet registrations:", error);
    return;
  }
  const tokens = [...new Set((rows ?? []).map((r) => r.push_token))];
  if (tokens.length === 0) return;

  const results = await pushAll(tokens);
  // 410 = the device removed the pass or the token expired: forget it.
  const gone = results.filter((r) => r.status === 410).map((r) => r.token);
  if (gone.length > 0) {
    await supabase.from("wallet_registrations").delete().in("push_token", gone);
  }
}

// Fire-and-forget from server actions; after() keeps the function alive on Vercel until done.
export function notifyPassChanged(serialNumber: string) {
  if (!walletEnabled() || !webServiceBase()) return;
  const run = () =>
    notify(serialNumber).catch((err) => console.error("Wallet push failed:", err));
  try {
    after(run);
  } catch {
    void run();
  }
}
