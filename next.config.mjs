/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: [
    {
      source: "/analytics/:path*",
      destination: "https://us.i.posthog.com/:path*",
    },
  ],
};

export default nextConfig;
