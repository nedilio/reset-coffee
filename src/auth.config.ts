import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnCard = nextUrl.pathname.startsWith("/card");
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/card", nextUrl)); // Redirect authenticated users to home page
      }
      if (isOnCard) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL(`/`, nextUrl)); // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL(`/card`, nextUrl));
      }
      return true;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
} satisfies NextAuthConfig;
