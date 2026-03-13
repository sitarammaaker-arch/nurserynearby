/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  redirects: async () => [
    { source: "/nurseries-in-:city", destination: "/nursery/:city", permanent: true },
    { source: "/nurseries/:city", destination: "/nursery/:city", permanent: true },
  ],
};
module.exports = nextConfig;
