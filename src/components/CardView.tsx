"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

const CardView = ({ email }: { email: string }) => {
  // Must run in the browser after hydration: posthog-js is not usable during server render.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    posthog.people.set({ email });
    posthog.capture("card_viewed", { email, $pathname: "/card" });
  }, [email]);

  return null;
};

export default CardView;
