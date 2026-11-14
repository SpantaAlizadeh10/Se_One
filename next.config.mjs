import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.pravatar.cc" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheStartUrl: false,
  dynamicStartUrl: false,
  cacheOnFrontEndNav: false,
  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.pathname.startsWith("/images/"),
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "public-images",
        expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
      },
    },
    {
      urlPattern: ({ url }) =>
        url.pathname === "/_next/image" &&
        (url.searchParams.get("url") ?? "").startsWith("/images/"),
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "optimized-public-images",
        expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
      },
    },
    {
      urlPattern: ({ url }) => url.pathname === "/api/youtube-videos",
      handler: "NetworkFirst",
      options: {
        cacheName: "public-youtube-feed",
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 1, maxAgeSeconds: 3600 },
      },
    },
  ],
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
