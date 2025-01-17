import posthog from "posthog-js";

const CardView = ({ email }: { email: string }) => {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host:
      "https://reset-coffee-git-develop-nedilios-projects.vercel.app/analytics",
    capture_pageview: false,
    capture_pageleave: false,
  });
  posthog.identify(email);
  return null;
};

export default CardView;
