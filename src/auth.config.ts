import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { supabase } from "./supabase.config";
import { removeAccents } from "./lib/utils";

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

      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/card", nextUrl)); // Redirect authenticated users to home page
      }

      if (isOnCard) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL(`/`, nextUrl)); // Redirect unauthenticated users to login page
      }
      return true;
    },
    session: async ({ session }) => {
      const role = adminEmails.includes(session.user.email) ? "admin" : "user";
      session.user.role = role;
      const { email, name, image } = session.user;
      const normalizedName = removeAccents(name ?? "");

      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", session.user.email);

      if (data && data.length === 0) {
        await supabase
          .from("users")
          .upsert({
            email,
            name: normalizedName,
            image,
            emailVerified: session.expires,
            role,
          });
      } else {
        await supabase
          .from("users")
          .update({
            name: normalizedName,
            image,
            emailVerified: session.expires,
            role,
          })
          .eq("email", session.user.email);
      }
      if (error) {
        console.error(error);
      }
      return session;
    },
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
} satisfies NextAuthConfig;
