import type { Metadata } from "next";
import { Fraunces, Inter, Vazirmatn } from "next/font/google";
import "../globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { locales, defaultLocale, isLocale } from "@/lib/i18n/locales";
import CookieConsent from "@/components/shared/CookieConsent";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const vazir = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-vazir",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Metadata {
  const lang = isLocale(params.lang) ? params.lang : defaultLocale;
  const isFa = lang === "fa";
  return {
    title: {
      default: isFa
        ? "SE ONE — یادگیری انگلیسی با اعتمادبه‌نفس"
        : "SE ONE — Learn English with Confidence",
      template: "%s | SE ONE",
    },
    description: isFa
      ? "با درس‌های تعاملی، مدرسان باتجربه و مسیرهای یادگیری شخصی‌سازی‌شده، انگلیسی را یاد بگیرید."
      : "Master English through interactive lessons, experienced teachers, and personalized learning paths.",
    icons: {
      icon: "/images/logo.png",
      apple: "/images/logo.png",
    },
    manifest: "/manifest.json",
    themeColor: "#182163",
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "SE ONE",
    },
  };
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = isLocale(params.lang) ? params.lang : defaultLocale;
  const dir = lang === "fa" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <body
        className={`${fraunces.variable} ${inter.variable} ${vazir.variable} font-sans antialiased bg-cream text-ink`}
      >
        <LanguageProvider initialLang={lang}>
          {children}
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}
