import type { NextConfig } from "next";
import config from "./src/lib/config.js";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: config.REMOTE_PATTERNS.map((pattern) => ({
      protocol: "https",
      hostname: pattern.hostname,
    })),
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
