import { ApiError } from "@/lib/api/client";

export function getAuthErrorMessage(error: unknown, lang: string): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return lang === "fa"
      ? "اتصال اینترنت قطع است. پس از اتصال دوباره تلاش کنید."
      : "You are offline. Reconnect to the internet and try again.";
  }

  if (error instanceof ApiError && error.status === 408) {
    return lang === "fa"
      ? "پاسخ سرور دیر رسید. اتصال را بررسی کنید و دوباره تلاش کنید."
      : "The server took too long to respond. Check your connection and try again.";
  }

  if (
    error instanceof TypeError ||
    (error instanceof ApiError && error.status === 0)
  ) {
    return lang === "fa"
      ? "ارتباط با سرور برقرار نشد. اینترنت را بررسی و دوباره تلاش کنید."
      : "Could not connect to the server. Check your internet connection and try again.";
  }

  return error instanceof Error
    ? error.message
    : lang === "fa"
      ? "خطای پیش‌بینی‌نشده‌ای رخ داد. دوباره تلاش کنید."
      : "Something went wrong. Please try again.";
}
