import { appConfig } from "@/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: appConfig.REMOTE_PATTERNS.map((pattern) => ({
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
