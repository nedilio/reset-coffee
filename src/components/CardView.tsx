import posthog from "posthog-js";

const CardView = ({ email }: { email: string }) => {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: false,
  });
  posthog.identify(email);
  return null;
};

export default CardView;
