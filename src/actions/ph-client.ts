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

  const client = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
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
  const flush = () => client.shutdown();
  try {
    after(flush);
  } catch {
    void flush();
  }
}
