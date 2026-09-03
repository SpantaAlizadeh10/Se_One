import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/locales";

const LOCALE_COOKIE = "se-one-lang";

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
    if (preferred && (locales as readonly string[]).includes(preferred)) {
      return preferred;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // skip static assets, API routes, and anything already locale-prefixed
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return NextResponse.next();

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // files like favicon.ico, robots.txt, etc.
  ) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"]
};
