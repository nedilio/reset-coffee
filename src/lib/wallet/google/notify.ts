import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { isUuid } from "@/lib/uuid";
import { patchObject } from "./api";
import { googleWalletEnabled } from "./config";
import { loyaltyObject } from "./pass";

// Pushes the new balance to Google. Only customers who saved the pass (google_wallet_at) cost an API call.
export async function notifyGooglePass(clientId: string) {
  if (!googleWalletEnabled() || !isUuid(clientId)) return;
  const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
  if (!client?.googleWalletAt) return;
  // NOTIFY asks Google for a field-update notification (it only fires for allowlisted fields).
  await patchObject({ ...loyaltyObject(client), notifyPreference: "NOTIFY" } as { id: string });
}
