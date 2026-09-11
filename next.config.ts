import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/demo.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/demo",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
