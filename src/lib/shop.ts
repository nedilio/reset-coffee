import "server-only";
import { cookies } from "next/headers";
import { shopLocations } from "@/lib/wallet/config";

export const SHOP_COOKIE = "reset_shop";

// Shop names come from WALLET_LOCATIONS, the same list the pass uses for lock-screen relevance.
export const shopNames = () => [
  ...new Set(
    shopLocations()
      .map((s) => s.name?.trim())
      .filter((n): n is string => Boolean(n))
  ),
];

// The shop the barista picked on this device (cookie), validated against the known names.
// null = none chosen, or only one shop exists so there is nothing to distinguish.
export const currentShop = async (): Promise<string | null> => {
  const names = shopNames();
  if (names.length < 2) return null;
  const value = (await cookies()).get(SHOP_COOKIE)?.value;
  return value && names.includes(value) ? value : null;
};
