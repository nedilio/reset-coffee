import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import { renderHero } from "@/lib/wallet/strip";

// Public on purpose: Google downloads it. It only draws stamps, no customer data.
export async function GET(_req: Request, { params }: { params: Promise<{ coffees: string }> }) {
  const n = Number((await params).coffees);
  if (!Number.isInteger(n) || n < 0 || n > COFFEES_TO_EXCHANGE) {
    return new Response(null, { status: 404 });
  }
  const png = await renderHero(n);
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
