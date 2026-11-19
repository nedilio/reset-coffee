/** @type {import('next').NextConfig} */
const nextConfig = {
  // VERCEL_ENV is production | preview | development on Vercel; locally fall back to NODE_ENV.
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // Which café this deployment serves; tags every analytics event so several cafés can share
    // one PostHog project. Set BUSINESS_NAME per deployment.
    NEXT_PUBLIC_BUSINESS_NAME: process.env.BUSINESS_NAME ?? "Reset Coffee",
  },
  // Pass icons/logos are read from disk at runtime; make sure Vercel bundles them.
  outputFileTracingIncludes: {
    "/api/wallet/**": ["./src/lib/wallet/assets/**"],
  },
  async rewrites() {
    return [
      {
        source: "/analytics/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
};

export default nextConfig;
