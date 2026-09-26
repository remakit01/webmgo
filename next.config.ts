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
      {
        source: '/ung-dung',
        destination: '/applications',
      },
      {
        source: '/ung-dung/:slug',
        destination: '/applications/:slug',
      },
    ];
  },
};

export default nextConfig;
