import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
    staleTimes: {
      dynamic: 120,
      static: 300,
    },
    turbopackFileSystemCacheForDev: true,
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
