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
  serverActions: {
    // To allow other projects to use the embedded iframe, you MUST whitelist their domains here.
    // Next.js blocks Cross-Origin Server Actions by default for security (CSRF protection).
    allowedOrigins: ["localhost:3000", "localhost:3001", "localhost:3002", "localhost:5173"],
  },
  outputFileTracingRoot: __dirname,

  /**
   * MULTI ZONES CONFIGURATION
   * 
   * As the "Main Zone", you can route specific URL paths to completely separate Next.js applications
   * (Child Zones) hosted elsewhere. The end user will see it as a single unified application.
   * 
   * Example below: Traffic going to /demo-app/... will be seamlessly proxied to https://other-domain.com/demo-app/...
   * Make sure the Child Zone has \`basePath: '/demo-app'\` in its own next.config.ts!
   */
  async rewrites() {
    return [
      // Example Multi Zone Rewrite:
      // {
      //   source: '/demo-app',
      //   destination: 'https://other-domain.com/demo-app',
      // },
      // {
      //   source: '/demo-app/:path*',
      //   destination: 'https://other-domain.com/demo-app/:path*',
      // },
    ];
  },
};

export default nextConfig;
