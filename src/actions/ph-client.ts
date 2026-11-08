import { PostHog } from "posthog-node";
import { after } from "next/server";

// One PostHog project is shared by every environment, so each event carries an
// `environment` property (production | preview | development). Filter dashboards on
// environment = production to keep test traffic out of the numbers.
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "development";

interface ServerEvent {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

export function captureServerEvent({
  distinctId,
  event,
  properties,
}: ServerEvent) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  // Not NEXT_PUBLIC_POSTHOG_HOST: that one is the browser proxy (/analytics, a relative or
  // localhost URL) and is unreachable from a server. Server events go straight to PostHog.
  const client = new PostHog(key, {
    host: process.env.POSTHOG_SERVER_HOST ?? "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  client.capture({
    distinctId,
    event,
    properties: { ...properties, environment: APP_ENV },
  });

  // On Vercel the function is frozen as soon as the response is sent, so a fire-and-forget
  // send never leaves. after() keeps it alive until the flush finishes without delaying the
  // user. Outside a request scope it throws; then just flush in the background.
  const flush = () => client.shutdown(5000);
  try {
    after(flush);
  } catch {
    void flush();
  }
}
