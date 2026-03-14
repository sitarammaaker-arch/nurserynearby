/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow all https images — needed for user-submitted nursery photos
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
    // Allow unoptimized external images as fallback
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      { source: "/nurseries-in-:city", destination: "/nursery/:city", permanent: true },
      { source: "/nurseries/:city",    destination: "/nursery/:city", permanent: true },
      { source: "/nurseries",          destination: "/nursery/all",   permanent: true },
    ];
  },
};
module.exports = nextConfig;
