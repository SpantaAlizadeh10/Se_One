import { locales, type Locale } from "./locales";

/** Strips a leading /fa or /en segment, returning a locale-agnostic path starting with "/". */
export function stripLocale(pathname: string): string {
  for (const l of locales) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1) || "/";
  }
  return pathname;
}

/** Prefixes a locale-agnostic path (e.g. "/dashboard") with the given locale. */
export function withLocale(lang: Locale, path: string): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${clean}`;
}
