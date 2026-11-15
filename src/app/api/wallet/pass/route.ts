import { auth } from "@/auth";
import { getClientByEmail } from "@/clients";
import { walletEnabled } from "@/lib/wallet/config";
import { captureServerEvent } from "@/actions/ph-client";
import { buildPass, PKPASS_HEADERS } from "@/lib/wallet/pass";

// "Agregar a Apple Wallet" on /card. /api is outside the proxy matcher, so check the session here.
export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return new Response("No autorizado", { status: 401 });
  if (!walletEnabled()) return new Response("Wallet no configurado", { status: 503 });

  const client = await getClientByEmail(email);
  if (!client) return new Response("Cliente no encontrado", { status: 404 });

  const pass = await buildPass(client);
  captureServerEvent({
    distinctId: email,
    event: "wallet_pass_downloaded",
    properties: { coffees: client.coffees },
  });
  return new Response(new Uint8Array(pass), {
    headers: {
      ...PKPASS_HEADERS,
      "Content-Disposition": 'attachment; filename="reset-coffee.pkpass"',
    },
  });
}
