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
        source: '/giai-phap-ung-dung',
        destination: '/applications',
      },
      {
        source: '/giai-phap-ung-dung/:slug',
        destination: '/applications/:slug',
      },
      {
        source: '/du-an',
        destination: '/projects',
      },
      {
        source: '/du-an/:slug',
        destination: '/projects/:slug',
      },
      {
        source: '/thu-vien-tai-lieu',
        destination: '/tech-library',
      },
      {
        source: '/huong-dan-thi-cong',
        destination: '/construction-guide',
      },
      {
        source: '/bao-gia',
        destination: '/quote',
      },
      {
        source: '/dai-ly',
        destination: '/dealer',
      },
    ];
  },
};

export default nextConfig;
