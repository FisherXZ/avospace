import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disabled due to Leaflet map initialization issues
  eslint: {
    // Skip ESLint during production builds for quick deployment
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
