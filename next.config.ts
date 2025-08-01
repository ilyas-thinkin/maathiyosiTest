import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    domains: ['source.unsplash.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

};

export default nextConfig;
