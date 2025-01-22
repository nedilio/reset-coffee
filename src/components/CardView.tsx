import posthog from "posthog-js";

const CardView = ({ email }: { email: string }) => {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: false,
    autocapture: false,
  });
  posthog.people.set({ email });
  posthog.capture("card_viewed", { email, $url: "/card" });
  return null;
};

export default CardView;
