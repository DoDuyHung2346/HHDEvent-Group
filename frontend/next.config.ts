import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cho phep truy cap dev server qua Cloudflare Quick Tunnel */
  allowedDevOrigins: ["*.trycloudflare.com"],
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
};

export default nextConfig;
