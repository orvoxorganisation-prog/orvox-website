import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in the home dir otherwise confuses
  // Turbopack's root inference.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Restrict the image optimizer to known hosts (closes the open image-proxy /
    // SSRF surface of `hostname: "**"`). Vercel Blob is always allowed; add more
    // CDNs via NEXT_PUBLIC_IMAGE_HOSTS="cdn.example.com,images.foo.com".
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      ...(process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
        .map((hostname) => ({ protocol: "https" as const, hostname })),
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
    // Persist Turbopack's dev cache to .next so the expensive cold compile
    // happens once per machine, not once per `npm run dev`.
    turbopackFileSystemCacheForDev: true,
  },
  // Baseline security headers applied to every response. CSP allows the inline
  // scripts/styles Next.js emits for hydration; 'unsafe-eval' is dev-only (HMR).
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
    ];
  },
};

export default nextConfig;
