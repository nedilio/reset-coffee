import { renderLogo } from "@/lib/wallet/strip";

export async function GET() {
  const png = await renderLogo();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
  });
}
