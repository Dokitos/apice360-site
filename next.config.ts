import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its bundled .afm font files from disk relative to its own
  // module directory at runtime; bundling it breaks that lookup, so it must
  // run via native `require` instead (see exports of /api/admin/leads/export).
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
