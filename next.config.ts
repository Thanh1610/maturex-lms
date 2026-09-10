import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/demo.html",
        destination: "/demo",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://127.0.0.1:${process.env.API_PORT || 3001}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
