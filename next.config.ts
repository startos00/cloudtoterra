import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (dev-only DB fallback) ships a WASM data asset; keep it external so it's
  // required from node_modules at runtime instead of being rewritten by the bundler.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
