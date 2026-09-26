import type { AdminCourse } from "@/lib/api/admin";
import { savePricing, type CoursePricing } from "@/lib/courses-pricing";

/** Keeps storefront localStorage pricing in sync after admin API loads/saves. */
export function syncPricingCacheFromAdmin(courses: AdminCourse[]): void {
  const pricing: CoursePricing[] = courses.map((c) => ({
    id: c.id,
    basePrice: c.basePrice,
    discountPercent: c.discountPercent,
  }));
  savePricing(pricing);
}
