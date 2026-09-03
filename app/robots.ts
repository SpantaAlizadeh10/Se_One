import type { MetadataRoute } from "next";

// Set NEXT_PUBLIC_SITE_URL once you have a real domain — used here and in sitemap.ts.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://seone.example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/dashboard/*", "/teacher", "/teacher/*", "/admin", "/admin/*", "/checkout/*"]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
