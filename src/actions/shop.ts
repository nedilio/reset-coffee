"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isAdmin, UNAUTHORIZED } from "@/lib/auth-guards";
import { SHOP_COOKIE, shopNames } from "@/lib/shop";

// Remembers which shop this device is working at, so every coffee event can say where it happened.
export const setShop = async (name: string) => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  if (!shopNames().includes(name)) return { error: "Local no válido." };
  (await cookies()).set(SHOP_COOKIE, name, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/admin", "layout");
  return { ok: true as const };
};
