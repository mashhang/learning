import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.1.11",
        port: "5001",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
