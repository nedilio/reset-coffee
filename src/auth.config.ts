import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { provisionClient } from "./clients";
import { captureServerEvent } from "./actions/ph-client";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const adminEmails = [
  "izquierdonelson@gmail.com",
  "rey.o.brian@gmail.com",
  "cvap13@gmail.com",
  "resetcoffeechile@gmail.com",
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = adminEmails.includes(auth?.user?.email ?? "");
      const isOnCard = nextUrl.pathname.startsWith("/card");
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isAdminPage = nextUrl.pathname.startsWith("/admin");
      const isHomePage = nextUrl.pathname === "/";

      if (isHomePage && isLoggedIn) {
        return Response.redirect(new URL("/card", nextUrl)); // Redirect authenticated users to home page
      }

      if (isAdminPage && !isLoggedIn) {
        return Response.redirect(new URL(`/`, nextUrl)); // Redirect unauthenticated users to login page
      }

      if (isAdminPage && isLoggedIn && !isAdmin) {
        return Response.redirect(new URL("/card", nextUrl)); // Non-admins can't see the admin page
      }

      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/card", nextUrl)); // Redirect authenticated users to home page
      }

      if (isOnCard) {
        if (isAdmin) return Response.redirect(new URL("/admin", nextUrl)); // Redirect authenticated users to home page
        if (isLoggedIn) return true;
        return Response.redirect(new URL(`/`, nextUrl)); // Redirect unauthenticated users to login page
      }
      return true;
    },
    // Runs on every auth() call (pages, navbar, middleware): keep it free of DB access.
    session: async ({ session }) => {
      session.user.role = adminEmails.includes(session.user.email)
        ? "admin"
        : "user";
      return session;
    },
    // Runs once per login: this is where the client row is created/refreshed.
    signIn: async ({ user }) => {
      const { email, name, image } = user;
      const role = adminEmails.includes(email ?? "") ? "admin" : "user";
      if (email) {
        try {
          await provisionClient({ email, name, image, role });
        } catch (error) {
          // Don't block the login; the card page re-creates the row if it is missing.
          console.error("Failed to provision client on sign in:", error);
        }
      }
      captureServerEvent({
        distinctId: email!,
        event: "login",
        properties: { role },
      });
      return true;
    },
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
} satisfies NextAuthConfig;
