/** Pure display helpers; course pricing itself is always API-sourced. */

export function getDiscountedPrice(basePrice: number, discountPercent: number): number {
  return Math.round(basePrice - (basePrice * discountPercent) / 100);
}

export function hasEffectiveDiscount(
  basePrice: number | undefined,
  discountPercent: number | undefined,
): basePrice is number {
  if (
    basePrice === undefined ||
    !Number.isFinite(basePrice) ||
    basePrice <= 0 ||
    discountPercent === undefined ||
    !Number.isFinite(discountPercent) ||
    discountPercent <= 0 ||
    discountPercent >= 100
  ) {
    return false;
  }
  return getDiscountedPrice(basePrice, discountPercent) < basePrice;
}

export function formatCurrencyPrice(
  amount: number,
  currency: string | undefined,
  lang: "fa" | "en",
): string {
  return new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", {
    style: "currency",
    currency: currency || (lang === "fa" ? "IRR" : "USD"),
    maximumFractionDigits: 0,
  }).format(amount);
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
