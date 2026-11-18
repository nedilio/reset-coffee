import { headers } from "next/headers";
import { auth } from "./auth";

export const UNAUTHORIZED = { error: "No autorizado." } as const;

// Server actions are public POST endpoints: every admin-only action must check this itself.
// Skips the cookie cache so the role is read from the DB: demoting an admin takes effect immediately.
export const isAdmin = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  return session?.user?.role === "admin";
};
