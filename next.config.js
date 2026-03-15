/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
    dangerouslyAllowSVG: true,
  },

  async redirects() {
    return [
      // ── Old nursery URL redirects ─────────────────────────
      { source: "/nurseries-in-:city", destination: "/nursery/:city", permanent: true },
      { source: "/nurseries/:city",    destination: "/nursery/:city", permanent: true },
      { source: "/nurseries",          destination: "/nursery/all",   permanent: true },

      // ── OLD state/district URLs → NEW clean URLs (301) ────
      // These preserve SEO rankings when Google has indexed old URLs
      { source: "/state/:state",                       destination: "/:state",            permanent: true },
      { source: "/state/:state/district/:district",    destination: "/:state/:district",  permanent: true },
    ];
  },
};
module.exports = nextConfig;
