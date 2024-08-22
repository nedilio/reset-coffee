import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { supabase } from "./supabase.config";

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
        // return Response.redirect(new URL(`/card`, nextUrl));
        return true;
      }
      return true;
    },
    session: async ({ session }) => {
      const role =
        session.user.email === "izquierdonelson@gmail.com" ? "admin" : "user";
      session.user.role = role;
      const { email, name, image, emailVerified } = session.user;
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", session.user.email);
      if (data && data.length === 0) {
        await supabase
          .from("users")
          .upsert({ email, name, image, emailVerified, role });
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
      // profile(profile) {
      //   console.log(profile);
      //   return {
      //     role: profile.role ?? "user",
      //     name: profile.name,
      //     email: profile.email,
      //     emailVerified: profile.email_verified,
      //     image: profile.picture,
      //   };
      // },
    }),
  ],
} satisfies NextAuthConfig;
