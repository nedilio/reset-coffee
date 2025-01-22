"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host:
      "https://reset-coffee-git-develop-nedilios-projects.vercel.app/analytics",
    capture_pageview: false,

    capture_pageleave: false,
  });
}

export const PhProvider = ({ children }: { children: React.ReactNode }) => {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
};
