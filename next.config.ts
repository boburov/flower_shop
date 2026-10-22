import path from "node:path";
import type { NextConfig } from "next";

/**
 * Flower images are served as plain static files from your VPS (see lib/config.ts).
 * During development we use local placeholders under /public/images/flowers, so no
 * remote host is required. When you point IMAGE_REMOTE_HOST at your VPS subdomain
 * (e.g. img.yourflowershop.uz) Next.js Image optimization is allowed to load from it.
 */
const remoteHost = process.env.IMAGE_REMOTE_HOST?.trim();

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, a stray lockfile in a
  // parent directory can make Next infer the wrong root and mis-resolve modules.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: remoteHost
      ? [
          {
            protocol: "https",
            hostname: remoteHost,
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
