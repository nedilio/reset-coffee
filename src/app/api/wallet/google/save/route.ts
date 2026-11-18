import { eq } from "drizzle-orm";
import { captureServerEvent } from "@/actions/ph-client";
import { getClientByEmail } from "@/clients";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { getSession } from "@/lib/auth-session";
import { upsertObject, ensureClass } from "@/lib/wallet/google/api";
import { googleWalletEnabled, objectId } from "@/lib/wallet/google/config";
import { loyaltyClass, loyaltyObject } from "@/lib/wallet/google/pass";
import { saveUrl } from "@/lib/wallet/google/save-jwt";

// "Agregar a Google Wallet" on /card. /api is outside the proxy matcher, so check the session here.
export async function GET() {
  const session = await getSession();
  const email = session?.user?.email;
  if (!email) return new Response("No autorizado", { status: 401 });
  if (!googleWalletEnabled()) return new Response("Google Wallet no configurado", { status: 503 });

  const client = await getClientByEmail(email);
  if (!client) return new Response("Cliente no encontrado", { status: 404 });

  try {
    await ensureClass(loyaltyClass());
    await upsertObject(loyaltyObject(client));
  } catch (error) {
    console.error(error);
    return new Response("No se pudo crear el pase. Intenta de nuevo.", { status: 502 });
  }
  await db
    .update(clients)
    .set({ googleWalletAt: new Date().toISOString() })
    .where(eq(clients.id, client.id));
  captureServerEvent({
    distinctId: email,
    event: "wallet_pass_downloaded",
    properties: { coffees: client.coffees, platform: "google" },
  });
  return Response.redirect(saveUrl(objectId(client.id)), 302);
}
