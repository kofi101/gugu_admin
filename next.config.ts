import type { NextConfig } from 'next';

// Static export for Firebase Hosting. No server runtime: no middleware,
// route handlers, server actions or next/image optimisation.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
