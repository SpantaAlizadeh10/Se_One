/** Pure display helpers; course pricing itself is always API-sourced. */

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
