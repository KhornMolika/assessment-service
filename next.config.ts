import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    staleTimes: {
      dynamic: 120,
      static: 300,
    },
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
