import type { Locale } from "@/lib/i18n/locales";

/** Parse API dates without shifting date-only values across time zones. */
export function parseApiDate(value: string): Date | null {
  if (!value) return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
        12,
      )
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getLocale(locale: Locale) {
  return locale === "fa" ? "fa-IR-u-ca-persian" : "en-US-u-ca-gregory";
}

export function formatApiDate(
  value: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {},
) {
  const date = parseApiDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(getLocale(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(date);
}

export function formatApiWeekday(value: string, locale: Locale) {
  return formatApiDate(value, locale, {
    year: undefined,
    month: undefined,
    day: undefined,
    weekday: "long",
  });
}
