import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: isProduction ? "learning-u25a.onrender.com" : "192.168.1.10",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
