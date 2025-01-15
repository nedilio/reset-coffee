import { PostHog } from "posthog-node";

export default function PosthogClient() {
  const PosthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
  return PosthogClient;
}
