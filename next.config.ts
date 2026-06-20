import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in the home dir otherwise confuses
  // Turbopack's root inference.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Allow admin-managed media from Vercel Blob and arbitrary https URLs.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
    // Persist Turbopack's dev cache to .next so the expensive cold compile
    // happens once per machine, not once per `npm run dev`.
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
