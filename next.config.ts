import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/san-pham',
        destination: '/products',
      },
      {
        source: '/san-pham/:slug',
        destination: '/products/:slug',
      },
    ];
  },
};

export default nextConfig;
