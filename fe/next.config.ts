import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// URL tiếng Việt (/san-pham...) và tiếng Anh (/en/products...) khai báo ở src/i18n/routing.ts (pathnames),
// proxy (src/proxy.ts) định tuyến — không dùng rewrites nữa.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
