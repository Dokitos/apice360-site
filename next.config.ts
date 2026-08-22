import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its bundled .afm font files from disk relative to its own
  // module directory at runtime; bundling it breaks that lookup, so it must
  // run via native `require` instead (see exports of /api/admin/leads/export).
  serverExternalPackages: ["pdfkit"],
  async headers() {
    // 'unsafe-inline' on script-src is required by Next.js's own inline
    // hydration scripts; img-src allows any https source since admins paste
    // arbitrary image URLs (partners, blog, etc); fonts.googleapis.com/
    // gstatic.com serve the Material Symbols icon font used sitewide (see
    // src/app/layout.tsx); *.tile.openstreetmap.org serves the map tiles
    // used by the contact page map (see src/components/ui/map.tsx) — Carto's
    // hosted vector tiles don't send CORS headers, so OSM's raster tiles are
    // used instead; worker-src blob: is required by maplibre-gl's tile worker.
    const csp = (frameAncestors: string) =>
      [
        "default-src 'self'",
        "img-src 'self' https: data: blob:",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://*.tile.openstreetmap.org",
        "worker-src 'self' blob:",
        `frame-ancestors ${frameAncestors}`,
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");
    const commonHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ];

    return [
      {
        // Every route except the section-preview iframe below, which the
        // admin editor deliberately embeds same-origin (see
        // src/components/admin/SectionsEditor.tsx).
        source: "/((?!admin/preview/).*)",
        headers: [
          ...commonHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: csp("'none'") },
        ],
      },
      {
        source: "/admin/preview/:path*",
        headers: [
          ...commonHeaders,
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: csp("'self'") },
        ],
      },
    ];
  },
};

export default nextConfig;
