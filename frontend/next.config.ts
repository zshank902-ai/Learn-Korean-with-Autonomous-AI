import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
const wsUrl = backendUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_WS_URL: `${wsUrl}/api`,
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
