import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { captureServerEvent } from "@/actions/ph-client";
import { provisionClient } from "@/clients";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { isSeedAdminEmail } from "./admins";

// Secret and base URL come from BETTER_AUTH_SECRET and BETTER_AUTH_URL.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
  },
  session: {
    // Signed cookie with the session: pages and the proxy skip the DB for 5 minutes.
    // Admin actions bypass it (see isAdmin) so a role change takes effect at once.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  databaseHooks: {
    user: {
      create: {
        // First admins are seeded from ADMIN_EMAILS; everyone else starts as a customer.
        before: async (user) => ({
          data: { ...user, role: isSeedAdminEmail(user.email) ? "admin" : "user" },
        }),
      },
    },
    session: {
      create: {
        // Runs once per login: this is where the customer row is created or refreshed.
        after: async (session) => {
          const [account] = await db
            .select()
            .from(schema.user)
            .where(eq(schema.user.id, session.userId));
          if (!account) return;

          const role = account.role;
          let isNew = false;
          if (role !== "admin") {
            try {
              ({ isNew } = await provisionClient({
                email: account.email,
                name: account.name,
                image: account.image,
              }));
            } catch (error) {
              // Don't block the login; /card re-creates the row if it is missing.
              console.error("Failed to provision client on sign in:", error);
            }
          }
          if (isNew) {
            captureServerEvent({
              distinctId: account.email,
              event: "signup",
              properties: { role, source: "login" },
              set: { email: account.email, name: account.name, role },
              setOnce: { signup_at: new Date().toISOString() },
            });
          }
          captureServerEvent({
            distinctId: account.email,
            event: "login",
            properties: { role, is_new: isNew },
          });
        },
      },
    },
  },
  // Must be the last plugin.
  plugins: [admin(), nextCookies()],
});
