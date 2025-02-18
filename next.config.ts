import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ...require('dotenv').config({ path: './stack.env' }).parsed
  }
};

export default nextConfig;
