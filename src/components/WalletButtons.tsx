"use client";

import { useSyncExternalStore } from "react";

type Platform = "ios" | "android" | "other";

const subscribe = () => () => {};
const clientPlatform = (): Platform => {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) ? "ios" : /Android/i.test(ua) ? "android" : "other";
};

// iPhone -> Apple, Android -> Google, anything else (desktop) -> both. The server render shows both.
export default function WalletButtons({ apple, google }: { apple: boolean; google: boolean }) {
  const platform = useSyncExternalStore(subscribe, clientPlatform, (): Platform => "other");

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {apple && platform !== "android" && (
        // Plain link (not fetch): Safari hands .pkpass responses straight to Wallet.
        <a href="/api/wallet/pass" className="active:scale-[0.98]">
          {/* Apple's official badge (es-MX). Its guidelines forbid editing it, so it's used as is. */}
          <img
            src="/img/add-to-apple-wallet-es.svg"
            alt="Agregar a Apple Wallet"
            width={153}
            height={48}
            className="h-12 w-auto"
          />
        </a>
      )}
      {google && platform !== "ios" && (
        // TODO: swap for Google's official "Add to Google Wallet" badge (public/img) before going live.
        <a
          href="/api/wallet/google/save"
          className="inline-flex h-12 items-center rounded-lg bg-black px-4 text-sm font-medium text-white active:scale-[0.98]"
        >
          Agregar a Google Wallet
        </a>
      )}
    </div>
  );
}
