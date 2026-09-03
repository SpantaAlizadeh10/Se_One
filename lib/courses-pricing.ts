/**
 * Course pricing + admin-managed discounts, persisted to localStorage
 * (same cross-tab-sync pattern as lib/slots-store.ts) so a discount an
 * admin sets is genuinely reflected on the storefront (LatestCourses)
 * in another tab — not just a number sitting in an admin table.
 *
 * `basePrice` is a plain USD number, independent of the dictionary's
 * pre-formatted display strings ("$49" / "۴۹$"), so a discount can be
 * computed and re-formatted per language via formatPrice() below.
 *
 * Swap for a real backend later: GET/PUT /api/admin/courses/:id/pricing.
 */

export type CoursePricing = {
  id: string;
  basePrice: number;
  discountPercent: number; // 0-100
};

export const coursesPricingSeed: CoursePricing[] = [
  { id: "beginners", basePrice: 1200000, discountPercent: 0 },
  { id: "everyday", basePrice: 1500000, discountPercent: 0 },
  { id: "advanced", basePrice: 1800000, discountPercent: 0 },
  { id: "ielts", basePrice: 6000000, discountPercent: 0 }
];

export const PRICING_STORAGE_KEY = "se-one-course-pricing";

export function loadPricing(): CoursePricing[] {
  if (typeof window === "undefined") return coursesPricingSeed;
  const raw = window.localStorage.getItem(PRICING_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as CoursePricing[];
    } catch {
      // fall through to reseed on corrupt data
    }
  }
  window.localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(coursesPricingSeed));
  return coursesPricingSeed;
}

export function savePricing(pricing: CoursePricing[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(pricing));
}

export function getDiscountedPrice(basePrice: number, discountPercent: number): number {
  return Math.round(basePrice - (basePrice * discountPercent) / 100);
}

const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function formatPrice(amount: number, lang: "fa" | "en"): string {
  const rounded = Math.round(amount);
  // Format with thousand separators
  const formatted = rounded.toLocaleString("en-US");

  if (lang === "fa") {
    const persianFormatted = formatted.replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
    return `${persianFormatted} تومان`;
  }
  return `${formatted} Toman`;
}
