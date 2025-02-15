import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Serve static files from public directory
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|gif)$/i,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
