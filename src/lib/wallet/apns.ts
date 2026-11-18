import "server-only";
import { connect } from "node:http2";
import { db } from "@/db";
import { walletRegistrations } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { certificates, passTypeId } from "./config";

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
  let rows: { pushToken: string }[];
  try {
    rows = await db
      .select({ pushToken: walletRegistrations.pushToken })
      .from(walletRegistrations)
      .where(eq(walletRegistrations.serialNumber, serialNumber));
  } catch (error) {
    console.error("Error reading wallet registrations:", error);
    return;
  }
  const tokens = [...new Set(rows.map((r) => r.pushToken))];
  if (tokens.length === 0) return;

  const results = await pushAll(tokens);
  // 410 = the device removed the pass or the token expired: forget it.
  const gone = results.filter((r) => r.status === 410).map((r) => r.token);
  if (gone.length > 0) {
    await db.delete(walletRegistrations).where(inArray(walletRegistrations.pushToken, gone));
  }
}

export { notify as notifyApplePass };
