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
    // hosted *vector* tiles don't send CORS headers, but their raster ones do,
    // and the cartography is far less dated than OSM's default;
    // worker-src blob: is required by maplibre-gl's tile worker.
    //
    // googletagmanager.com / connect.facebook.net serve the Google Analytics
    // and Meta Ads tags (see src/components/layout/Analytics.tsx), with their
    // respective collection endpoints on connect-src. Listing a host here only
    // permits it: nothing is requested unless the IDs are filled in under
    // Definições do Site, and not before the visitor accepts cookies.
    const analyticsScripts = ["https://www.googletagmanager.com", "https://connect.facebook.net"];
    const analyticsEndpoints = [
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://*.googletagmanager.com",
      "https://www.facebook.com",
    ];
    const csp = (frameAncestors: string) =>
      [
        "default-src 'self'",
        "img-src 'self' https: data: blob:",
        // Sem media-src, um <video> alojado no Vercel Blob cairia no
        // default-src 'self' e não tocava — o ficheiro carrega, o leitor fica
        // preto e não há erro visível na página.
        "media-src 'self' https: data: blob:",
        `script-src 'self' 'unsafe-inline' ${analyticsScripts.join(" ")}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        // vercel.com e o host do Blob: o painel envia os ficheiros da galeria
        // do browser directamente para o armazenamento, sem passarem pelo
        // servidor (ver api/admin/upload/token).
        `connect-src 'self' https://services.arcgisonline.com https://vercel.com https://*.public.blob.vercel-storage.com ${analyticsEndpoints.join(" ")}`,
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
