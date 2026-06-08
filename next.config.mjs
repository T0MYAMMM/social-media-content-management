/** @type {import('next').NextConfig} */
const nextConfig = {
  // cacheComponents (aggressive PPR) statically prerenders pages; these
  // templates are fully client-data-driven (Convex via useQuery), which fights
  // PPR and crashed the home route in prod. Standard rendering is correct here.
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Convex storage (admin-uploaded images) — any deployment subdomain.
      { protocol: "https", hostname: "**.convex.cloud", pathname: "/api/storage/**" },
      // Google Photos media (baseUrl thumbnails/downloads).
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      // Google Drive thumbnails / download links.
      { protocol: "https", hostname: "drive.google.com" },
    ],
  },
};

export default nextConfig;
