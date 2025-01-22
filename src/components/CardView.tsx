import posthog from "posthog-js";

const CardView = ({ email }: { email: string }) => {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageleave: false,
  });
  posthog.people.set({ email });
  posthog.capture("card_viewed", { email, $pathname: "/card" });
  return null;
};

export default CardView;
