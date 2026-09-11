import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@maturex/ui", "@maturex/database"],
};

export default nextConfig;
