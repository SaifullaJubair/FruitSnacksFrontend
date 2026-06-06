/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fruit-snacks.sgp1.cdn.digitaloceanspaces.com",
        pathname: "**",
      },
      {
        // Legacy bucket — existing DB still references old Artisan Leather images.
        protocol: "https",
        hostname: "artisen-leather.sgp1.cdn.digitaloceanspaces.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "sin1.contabostorage.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "cit-node.blr1.cdn.digitaloceanspaces.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "source.pexels.com",
        pathname: "**",
      },
    ],
  },
  async redirects() {
    // S1 (2026-06-04) — /cart route renamed to /checkout. Keep old bookmarks
    // + indexed links working with a permanent 301.
    return [
      {
        source: "/cart",
        destination: "/checkout",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
