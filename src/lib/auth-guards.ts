import { auth } from "@/auth";

export const UNAUTHORIZED = { error: "Unauthorized" } as const;

// Server actions are public POST endpoints: every admin-only action must check this itself.
export const isAdmin = async () => {
  const session = await auth();
  return session?.user?.role === "admin";
};
