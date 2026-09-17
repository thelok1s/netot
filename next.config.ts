import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    "/api/lab-content": ["./public/data/**/*"],
  },
};

export default nextConfig;
