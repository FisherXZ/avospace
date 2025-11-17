import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disabled due to Leaflet map initialization issues
};

export default nextConfig;
