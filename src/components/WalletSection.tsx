import { IconWallet } from "@tabler/icons-react";
import QRCode from "qrcode";
import { walletEnabled } from "@/lib/wallet/config";
import { signClientToken } from "@/lib/wallet/token";

// Server component for /card: the "add to Wallet" link and the same QR the pass carries,
// so customers without an iPhone can still be scanned at the counter.
export default async function WalletSection({ clientId }: { clientId: string }) {
  if (!process.env.WALLET_SECRET) return null;
  const qr = await QRCode.toString(signClientToken(clientId), {
    type: "svg",
    margin: 1,
    color: { dark: "#415942", light: "#ffffff" },
  });

  return (
    <section className="flex w-full max-w-md flex-col items-center gap-3 pb-4">
      {walletEnabled() && (
        // Plain link (not fetch): Safari hands .pkpass responses straight to Wallet.
        <a
          href="/api/wallet/pass"
          className="flex h-12 items-center gap-2 rounded-xl bg-black px-5 font-semibold text-white shadow-sm active:scale-[0.98]"
        >
          <IconWallet className="size-5" aria-hidden="true" />
          Agregar a Apple Wallet
        </a>
      )}
      <div className="flex flex-col items-center gap-1">
        <div
          className="size-40 rounded-xl border border-resetGreen/15 bg-white p-2 shadow-sm"
          aria-label="Tu código para sumar cafés"
          role="img"
          dangerouslySetInnerHTML={{ __html: qr }}
        />
        <p className="text-xs text-resetGreen/80">Muéstralo al pedir para sumar tu café</p>
      </div>
    </section>
  );
}
