import { headers } from "next/headers";
import { auth } from "./auth";

export const UNAUTHORIZED = { error: "No autorizado." } as const;

// Server actions are public POST endpoints: every admin-only action must check this itself.
// Skips the cookie cache so the role is read from the DB: demoting an admin takes effect immediately.
// Returns the admin's user id (recorded in card_events) or null when not an admin.
export const getAdminId = async (): Promise<string | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  return session?.user?.role === "admin" ? session.user.id : null;
};

export const isAdmin = async () => (await getAdminId()) !== null;
