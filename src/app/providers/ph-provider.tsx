"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageleave: false,
    // Baristas work in /admin: drop their anonymous pageviews and clicks so they do not
    // pollute customer metrics. Business events come from the server and are unaffected.
    before_send: (event) =>
      window.location.pathname.startsWith("/admin") ? null : event,
  });
  // Attached to every browser event; see APP_ENV in src/actions/ph-client.ts.
  posthog.register({ environment: process.env.NEXT_PUBLIC_APP_ENV });
}

export const PhProvider = ({ children }: { children: React.ReactNode }) => {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
};
