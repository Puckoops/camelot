import { join } from "node:path";
import type { NextConfig } from "next";

const monorepoRoot = join(process.cwd(), "..", "..");

const nextConfig: NextConfig = {
  turbopack: { root: monorepoRoot },
  outputFileTracingRoot: monorepoRoot,
  async redirects() {
    return [
      { source: "/docs/mcp/tools", destination: "/docs/mcp/tool-reference", permanent: true },
      { source: "/docs/mcp/try", destination: "/docs/mcp/try-it-out", permanent: true },
    ];
  },
};

export default nextConfig;
