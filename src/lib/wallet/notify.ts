import "server-only";
import { after } from "next/server";
import { walletEnabled, webServiceBase } from "./config";
import { notifyApplePass } from "./apns";
import { notifyGooglePass } from "./google/notify";

// Fire-and-forget from server actions; after() keeps the function alive on Vercel until done.
// Each wallet has its own catch so one failing never blocks the other.
export function notifyPassChanged(serialNumber: string) {
  const run = () =>
    Promise.all([
      walletEnabled() && webServiceBase()
        ? notifyApplePass(serialNumber).catch((err) => console.error("Apple Wallet push failed:", err))
        : null,
      notifyGooglePass(serialNumber).catch((err) => console.error("Google Wallet update failed:", err)),
    ]);
  try {
    after(run);
  } catch {
    void run();
  }
}
