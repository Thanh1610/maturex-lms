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
};

export default nextConfig;
