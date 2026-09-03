import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/locales";

// Set NEXT_PUBLIC_SITE_URL once you have a real domain.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://seone.example.com";

// Public marketing routes only — dashboards and checkout are excluded
// via robots.ts and shouldn't be indexed anyway.
const paths = ["", "/about", "/contact", "/courses", "/our-instructors", "/become-teacher", "/login", "/signup", "/privacy-policy", "/terms", "/forgot-password"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of locales) {
    for (const path of paths) {
      entries.push({
        url: `${SITE_URL}/${lang}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7
      });
    }
  }

  return entries;
}
